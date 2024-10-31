import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { employeeId, date, fromDate, toDate } = req.query;
  const searchConditions: Prisma.Sql[] = []
  searchConditions.push(Prisma.sql`A.delete_flag = 0`)
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

  const currentResource = await prisma.$queryRaw`
    SELECT 
      sum(A.plan_effort) AS planEffort,
      DATE_FORMAT(A.date, "%Y-%m-%d") AS date
    FROM 
      CurrentResource A
    ${where}
    GROUP BY
    A.date
  `;

  res.status(200).json({
    currentResource,
  })
}
