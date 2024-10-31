import prisma from "@/lib/prisma";
import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const employees = await prisma.$queryRaw`
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
    Where 
      A.delete_flag = 0;
      `;

  res.status(200).json({
    employees
  });
}
