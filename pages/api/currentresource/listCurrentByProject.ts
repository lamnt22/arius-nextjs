import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId, employeeId, date, fromDate, toDate } = req.query;
  const searchConditions: Prisma.Sql[] = []
  searchConditions.push(Prisma.sql`A.delete_flag = 0`)
  if (projectId) {
    searchConditions.push(Prisma.sql`B.project_id = ${projectId}`)
  }
  if (employeeId) {
    searchConditions.push(Prisma.sql`A.employee_id = ${employeeId}`)
  }

  if (date) {
    searchConditions.push(Prisma.sql`A.date = ${date}`)
  }

  if (fromDate && toDate) {
    searchConditions.push(Prisma.sql`A.date >= ${fromDate} AND A.date <= ${toDate}`)
  }

  const where = searchConditions.length ? 
    Prisma.sql`where ${Prisma.join(searchConditions, ' AND ')}` : Prisma.empty

  const currentResourceByProjectIdAndEmployeeId = await prisma.$queryRaw`
    SELECT 
      A.employee_id AS employeeId,
      A.date AS date,
      A.plan_effort AS planEffort
    FROM 
      CurrentResource A
    LEFT JOIN ResourceAllocation B ON A.resource_allocation_id = B.id
    ${where}
  `;

  res.status(200).json({
    currentResourceByProjectIdAndEmployeeId,
  })
}
