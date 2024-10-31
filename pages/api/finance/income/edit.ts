import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, type, incomeDate, amount, currency, detail, projectId, email } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (user) {
    const exists = await prisma.income.findFirst({
      where: {
        id
      },
    });

    if (exists) {
      const income = await prisma.income.update({
        where: {
          id: id,
        },
        data: {
          income_date: incomeDate,
          type: type,
          amount: Number(amount),
          currency: currency,
          detail: detail,
          reference_id: (projectId == null || projectId == "") ? null : Number(projectId),
          update_by: user.id,
        },
      });
  
      res.status(200).json(income);

    } else {
      res.status(400).send("Income information is not exists");
    }

  } else {
    res.status(400).send("Access Denied.");
  }
}
