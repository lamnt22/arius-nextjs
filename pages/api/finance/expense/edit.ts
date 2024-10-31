import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, type, requestDate, deadline, amount, currency, detail, status, email, description } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (user) {
    const exists = await prisma.expense.findFirst({
      where: {
        id
      },
    });

    if (exists) {
      const expense = await prisma.expense.update({
        where: {
          id: id,
        },
        data: {
          request_date: requestDate,
          deadline: deadline,
          type: type,
          amount: Number(amount),
          currency: currency,
          detail: detail,
          status: status,
          description: description,
          update_by: user.id,
        },
      });
  
      res.status(200).json(expense);

    } else {
      res.status(400).send("Expense information is not exists");
    }

  } else {
    res.status(400).send("Access Denied.");
  }
}
