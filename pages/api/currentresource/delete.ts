import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { resourceAllocationId } = req.query;
  let result = true;

  const searchConditions: Prisma.Sql[] = []
  if (resourceAllocationId) {
    searchConditions.push(Prisma.sql`resource_allocation_id = ${Number(resourceAllocationId)}`)
  }

  const where = searchConditions.length ? 
    Prisma.sql`where ${Prisma.join(searchConditions, ' AND ')}` : Prisma.empty

  const currentResource = await prisma.$queryRaw`
    DELETE 
    FROM 
      CurrentResource
    ${where};
  `.catch(() => {
    result = false;
  });

  result ? res.status(200).send(currentResource) : res.status(400).send("currentResource is not exists");
}
