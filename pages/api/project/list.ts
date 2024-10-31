import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {projectId, keyword, customerId, status, page } = req.query;

  const query = `%${keyword}%`;

  const searchConditions: Prisma.Sql[] = []
  searchConditions.push(Prisma.sql`A.delete_flag = 0`)
  if (customerId) {
    searchConditions.push(Prisma.sql`A.customer_id = ${customerId}`)
  }
  if (keyword) {
    searchConditions.push(Prisma.sql`
      (A.name LIKE ${query} OR A.code LIKE ${query} OR B.name LIKE ${query} OR B.code LIKE ${query})
    `)
  }
  if (status) {
    searchConditions.push(Prisma.sql`
      A.status = ${status}
    `)
  }
  if (projectId) {
    searchConditions.push(Prisma.sql`A.id = ${projectId}`)
  }

  const where = searchConditions.length ? 
    Prisma.sql`where ${Prisma.join(searchConditions, ' AND ')}` : Prisma.empty

  const maxResults = BigInt(20);

  let offset = BigInt(Number(page) - 1)*maxResults;

  const count:any = await prisma.$queryRaw`
    SELECT 
      COUNT(*) AS total
    FROM 
      Project A 
      LEFT JOIN Customer B ON B.id =  A.customer_id
      LEFT JOIN Department C ON C.id = A.department_id
      LEFT JOIN Employee D ON D.id = A.project_manager_id
    ${where}
  `;

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
      A.cost_budget AS costBudget,
      A.currency AS currency
    FROM 
      Project A 
      LEFT JOIN Customer B ON B.id =  A.customer_id
      LEFT JOIN Department C ON C.id = A.department_id
      LEFT JOIN Employee D ON D.id = A.project_manager_id
    ${where}
    LIMIT ${offset}, ${maxResults}
      ;
  `;

  const customers = await prisma.$queryRaw<{ id: number }[]>`
    SELECT 
      * 
    FROM 
      Customer
    WHERE
      delete_flag = 0
      ;
  `; 

const departments = await prisma.$queryRaw<{ id: number }[]>`
  SELECT 
    * 
  FROM 
    Department
  WHERE
    delete_flag = 0
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

const insightMaster = await prisma.$queryRaw`
  SELECT 
      * 
  FROM 
    InsightMaster a
  WHERE 
    a.delete_flag = 0 AND a.key = 'project_cost_rate';
`;
  
  res.status(200).json({
    projects,
    customers,
    departments, 
    employees,
    insightMaster,
    total: Number(count[0].total),
    maxResults: Number(maxResults)
  });
}
