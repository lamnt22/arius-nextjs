import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { keyword, type, projectId, page } = req.query;

  const query = `%${keyword}%`;

  const searchConditions: Prisma.Sql[] = []
  searchConditions.push(Prisma.sql`A.delete_flag = 0`)
  if (type) {
    searchConditions.push(Prisma.sql`A.type = ${type}`)
  }
  if (keyword) {
    searchConditions.push(Prisma.sql`
      (A.detail LIKE ${query} OR A.description LIKE ${query} OR C.name LIKE ${query} OR C.code LIKE ${query})
    `)
  }
  if (projectId) {
    searchConditions.push(Prisma.sql`
      A.reference_id = ${projectId}
    `)
  }

  const where = searchConditions.length ? 
    Prisma.sql`where ${Prisma.join(searchConditions, ' AND ')}` : Prisma.empty

  const maxResults = BigInt(20);

  let offset = BigInt(Number(page) - 1)*maxResults;

  const count:any = await prisma.$queryRaw`
    SELECT 
      COUNT(*) AS total
    FROM 
      Income A 
      LEFT JOIN User B ON B.id =  A.create_by
      LEFT JOIN Employee C ON C.id = B.employee_id
      LEFT JOIN Project D ON D.id = A.reference_id
    ${where}
  `;

  const incomes = await prisma.$queryRaw`
    SELECT 
      A.id,
      DATE_FORMAT(A.income_date, "%Y-%m-%d") AS incomeDate,
      A.type,
      A.amount,
      A.currency,
      A.detail,
      DATE_FORMAT(CONVERT_TZ(A.update_at,'+00:00', '+07:00'), "%Y-%m-%d %H:%i") AS processDate,
      D.code AS referenceCode,
      C.code AS createBy
    FROM 
      Income A 
      LEFT JOIN User B ON B.id =  A.create_by
      LEFT JOIN Employee C ON C.id = B.employee_id
      LEFT JOIN Project D ON D.id = A.reference_id
    ${where}
    LIMIT ${offset}, ${maxResults}
      ;
  `;

  const projects = await prisma.$queryRaw<{ id: number }[]>`
    SELECT 
      * 
    FROM 
      Project
    WHERE
      delete_flag = 0
      ;
  `; 
  
  res.status(200).json({
    incomes,
    projects,
    total: Number(count[0].total),
    maxResults: Number(maxResults)
  });
}
