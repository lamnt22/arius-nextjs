import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { keyword, type, status, page } = req.query;

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
  if (status) {
    searchConditions.push(Prisma.sql`
      A.status = ${status}
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
      Expense A 
      LEFT JOIN User B ON B.id =  A.create_by
      LEFT JOIN Employee C ON C.id = B.employee_id
    ${where}
  `;

  const expenses = await prisma.$queryRaw`
    SELECT 
      A.id,
      DATE_FORMAT(A.request_date, "%Y-%m-%d") AS requestDate,
      DATE_FORMAT(A.deadline, "%Y-%m-%d") AS deadline,
      A.type,
      A.amount,
      A.currency,
      A.detail,
      A.status,
      A.description,
      DATE_FORMAT(CONVERT_TZ(A.update_at,'+00:00', '+07:00'), "%Y-%m-%d %H:%i") AS processDate,
      C.code AS requestBy
    FROM 
      Expense A 
      LEFT JOIN User B ON B.id =  A.create_by
      LEFT JOIN Employee C ON C.id = B.employee_id
    ${where}
    LIMIT ${offset}, ${maxResults}
      ;
  `;
  
  res.status(200).json({
    expenses,
    total: Number(count[0].total),
    maxResults: Number(maxResults)
  });
}
