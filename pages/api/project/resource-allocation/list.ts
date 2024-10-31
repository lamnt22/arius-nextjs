import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId, page, maxResult } = req.query;

  const searchConditions: Prisma.Sql[] = []
  searchConditions.push(Prisma.sql`A.delete_flag = 0`)
  if (projectId) {
    searchConditions.push(Prisma.sql`A.project_id = ${projectId}`)
  }


  const where = searchConditions.length ? 
    Prisma.sql`where ${Prisma.join(searchConditions, ' AND ')}` : Prisma.empty

  const maxResults = BigInt(Number(maxResult));

  let offset = BigInt(Number(page) - 1)*maxResults;

  const count:any = await prisma.$queryRaw`
    SELECT 
      COUNT(*) AS total
    FROM 
      ResourceAllocation A 
      LEFT JOIN Project B ON B.id =  A.project_id
      LEFT JOIN Employee C ON C.id = A.employee_id
    ${where}
  `;

  const resourceAllocations = await prisma.$queryRaw`
    SELECT 
      A.id,
      A.project_id AS projectId,
      A.employee_id AS employeeId,
      C.name, 
      A.position,
      A.plan_effort AS planEffort,
      DATE_FORMAT(A.start_date, "%Y-%m-%d") AS startDate,
      DATE_FORMAT(A.end_date, "%Y-%m-%d") AS endDate,
      A.description,
      A.mm,
      D.salary
    FROM 
      ResourceAllocation A 
      LEFT JOIN Project B ON B.id =  A.project_id
      LEFT JOIN Employee C ON C.id = A.employee_id
      LEFT JOIN EmployeeSalary D ON D.employee_id = A.employee_id
    ${where}
    LIMIT ${offset}, ${maxResults}
      ;
  `;

  res.status(200).json({
    resourceAllocations,
    total: Number(count[0].total),
    maxResults: Number(maxResults)
  })
}
