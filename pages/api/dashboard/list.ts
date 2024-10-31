import prisma from "@/lib/prisma";
import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { newYear } = req.query;
  const searchConditionExpense: Prisma.Sql[] = []
  if (newYear) {
    searchConditionExpense.push(Prisma.sql`year(A.start_date) = ${newYear}`)
    searchConditionExpense.push(Prisma.sql`year(A.end_date) = ${newYear}`)
  }
  const where = searchConditionExpense.length ? 
    Prisma.sql`where ${Prisma.join(searchConditionExpense, ' AND ')}` : Prisma.empty

    const projects = await prisma.$queryRaw`
    SELECT 
      A.id,
      A.name,
      A.code,
      A.customer_id AS customerId,
      B.code AS customerCode,
      B.name AS customerName,
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
      `;

  res.status(200).json({
    projects
  });
}
