import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {type, incomeDate, amount, currency, detail, referenceId, email } = req.body;

  console.log("Request Body: ", req.body);

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (user) {
    const income = await prisma.income.create({
      data: {
        income_date: incomeDate,
        type: type,
        amount: Number(amount),
        currency: currency,
        detail: detail,
        reference_id: referenceId == "" ? null : Number(referenceId),
        create_by: user.id,
      },
    });
  
    res.status(200).json(income);

  } else {
    res.status(400).send("Access Denied.");
  }
}
