import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  
  const { employeeId } = req.query;
  const query = `${employeeId}`;
  const searchConditions: Prisma.Sql[] = []
  searchConditions.push(Prisma.sql`A.delete_flag = 0`)
  if(employeeId){
    searchConditions.push(Prisma.sql`A.project_manager_id = ${query}`)
  }
  const where = searchConditions.length ? 
  Prisma.sql`where ${Prisma.join(searchConditions, ' AND ')}` : Prisma.empty

  const projects = await prisma.$queryRaw`
    SELECT 
      A.id,
      A.name,
      A.code,
      A.customer_id AS customerId,
      B.code AS customerCode,
      A.department_id AS departmentId,
      C.name AS departmentName,
      DATE_FORMAT(A.start_date, "%Y-%m-%d") AS startDate,
      DATE_FORMAT(A.end_date, "%Y-%m-%d") AS endDate,
      A.rank,
      A.status,
      A.project_manager_id AS projectManagerId,
      D.code AS projectManagerCode,
      A.billing_effort,
      A.cost,
      A.cost_budget
    FROM 
      Project A 
      LEFT JOIN Customer B ON B.id =  A.customer_id
      LEFT JOIN Department C ON C.id = A.department_id
      LEFT JOIN Employee D ON D.id = A.project_manager_id
      ${where}
      ;
  `;

  const employees = await prisma.$queryRaw<{ id: number }[]>`
    SELECT 
      * 
    FROM 
      Employee
    WHERE
      delete_flag = 0
      ;
  `; 

  
  res.status(200).json({
    projects,
    employees,
  })
}
