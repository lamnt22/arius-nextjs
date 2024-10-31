import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {key, value, description } = req.body;
  const exists = await prisma.insightMaster.findFirst({
    where: {
      key,
    },
  });
  if (exists) {
    res.status(400).send("Insightmaster already exists");
  } else {
    const insightMaster = await prisma.insightMaster.create({
      data: {
        key: key,
        value: value,
        description: description
      },
    });
    res.status(200).json(insightMaster);
  }
}
