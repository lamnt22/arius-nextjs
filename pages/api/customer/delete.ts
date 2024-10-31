import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.body;

  let result = true;

  const deleteCustomer = await prisma.customer.delete({
    where: {
      id,
    }
  }).catch(() => {
    result = false;
  });

  result ? res.status(200).send(deleteCustomer) : res.status(400).send("Customer is not exists");
}
