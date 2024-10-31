import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, value } = req.body;
  
    const expenseBudget = await prisma.expenseBudget.update({
      where: {
        id: id,
      },
      data: {
        value: Number(value),
      },
    });
    res.status(200).json(expenseBudget);
}
