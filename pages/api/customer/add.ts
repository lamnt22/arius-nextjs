import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {name, code, type, description } = req.body;
  const exists = await prisma.customer.findFirst({
    where: {
      code,
    },
  });
  if (exists) {
    res.status(400).send("Customer already exists");
  } else {
    const customer = await prisma.customer.create({
      data: {
        name,
        code,
        type,
        description
      },
    });
    res.status(200).json(customer);
  }
}
