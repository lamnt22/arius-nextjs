import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.body;

  let result = true;

  const deleteInsightMaster = await prisma.insightMaster.delete({
    where: {
      id,
    }
  }).catch(() => {
    result = false;
  });

  result ? res.status(200).send(deleteInsightMaster) : res.status(400).send("Master Data is not exists");
}
