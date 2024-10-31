import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { expenseId } = req.query;

    const files = await prisma.$queryRaw`
    SELECT 
      *
    FROM 
        ExpenseDocument 
    WHERE
        expense_id = ${expenseId}
    `

    res.status(200).json({
        files,
      });
  }