import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.body;

  let result = true;

  const deleteProject = await prisma.project.delete({
    where: {
      id,
    }
  }).catch(() => {
    result = false;
  });

  result ? res.status(200).send(deleteProject) : res.status(400).send("Project is not exists");
}
