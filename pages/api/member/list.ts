import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { keyword,employeeId, position, page } = req.query;

  const query = `%${keyword}%`;

  const searchConditions: Prisma.Sql[] = []
  searchConditions.push(Prisma.sql`A.delete_flag = 0`)
  if (position) {
    searchConditions.push(Prisma.sql`A.position = ${position}`)
  }
  if (keyword) {
    searchConditions.push(Prisma.sql`(A.name LIKE ${query} OR A.code LIKE ${query})`)
  }
  if(employeeId){
    searchConditions.push(Prisma.sql`A.id = ${employeeId}`)
  }

  const where = searchConditions.length ? 
    Prisma.sql`where ${Prisma.join(searchConditions, ' AND ')}` : Prisma.empty
  
  const maxResults = BigInt(20);

  let offset = BigInt(Number(page) - 1)*maxResults;

  const count:any = await prisma.$queryRaw`
    SELECT 
      COUNT(*) AS total
    FROM 
      Employee A
    ${where}
  `;

  const members = await prisma.$queryRaw`
    SELECT 
      A.id,
      A.name,
      A.code,
      A.position,
      A.phone,
      DATE_FORMAT(A.birthday, "%Y-%m-%d") AS birthday,
      A.address,
      A.status,
      B.salary 
    FROM 
      Employee A 
      LEFT JOIN EmployeeSalary B ON B.employee_id =  A.id
    ${where}
    LIMIT ${offset}, ${maxResults}
      ;
  `;
  
  res.status(200).json({
    members,
    total: Number(count[0].total),
    maxResults: Number(maxResults)
  });
}
