import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.body;

  let result = true;

  const deleteHoliday = await prisma.holiday.delete({
    where: {
      id,
    }
  }).catch(() => {
    result = false;
  });

  result ? res.status(200).send(deleteHoliday) : res.status(400).send("Holiday is not exists");
}