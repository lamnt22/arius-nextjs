import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const expenseBudgets = await prisma.$queryRaw`
    SELECT 
      * 
    FROM 
      ExpenseBudget
    WHERE 
      delete_flag = 0
      ;
  `;

  res.status(200).json({
    expenseBudgets
  });
}
