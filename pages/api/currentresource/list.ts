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
      A.id,
      A.employee_id AS employeeId,
      DATE_FORMAT(A.date, "%Y-%m-%d") AS date,
      A.plan_effort AS planEffort,
      A.remain_effort AS remainEffort,
      A.description
    FROM 
      CurrentResource A
    ${where};
  `;

  res.status(200).json({
    currentResource,
  })
}
