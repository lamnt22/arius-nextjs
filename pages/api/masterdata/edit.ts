import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, key, value, description } = req.body;

  const exists = await prisma.insightMaster.findFirst({
    where: {
      key,
      NOT: {
        id
      }
    },
  });
  if (exists) {
    res.status(400).send("Master Data already exists");
  } else {
    const insightMaster = await prisma.insightMaster.update({
      where: {
        id: id,
      },
      data: {
        key: key,
        value: value,
        description: description
      },
    });

    res.status(200).json(insightMaster);
  }
}
