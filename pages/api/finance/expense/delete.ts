import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.body;

  let result = true;

  const deleteExpense = await prisma.expense.delete({
    where: {
      id,
    }
  }).catch(() => {
    result = false;
  });

  result ? res.status(200).send(deleteExpense) : res.status(400).send("Expense information is not exists");
}
