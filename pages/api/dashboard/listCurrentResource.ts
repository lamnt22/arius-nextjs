import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { employeeId, fromMonth, toMonth } = req.query;
  const searchConditions: Prisma.Sql[] = []
  searchConditions.push(Prisma.sql`A.delete_flag = 0`)
  if (employeeId) {
    searchConditions.push(Prisma.sql`A.employee_id = ${employeeId}`)
  }

  if (fromMonth) {
    searchConditions.push(Prisma.sql`month(A.date) >= ${fromMonth}`)
  }

  if (toMonth) {
    searchConditions.push(Prisma.sql`month(A.date) <= ${toMonth}`)
  }
  const where = searchConditions.length ? 
    Prisma.sql`where ${Prisma.join(searchConditions, ' AND ')}` : Prisma.empty

  const currentResource = await prisma.$queryRaw`
    SELECT 
      A.plan_effort AS planEffort,
      A.date
    FROM 
      CurrentResource A
    ${where}
    ORDER BY A.date ASC;
  `;

  res.status(200).json({
    currentResource,
  })
}
