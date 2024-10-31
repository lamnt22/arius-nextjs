import prisma from "@/lib/prisma";
import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { key } = req.query;
  const searchCondition: Prisma.Sql[] = []
  if (key) {
    searchCondition.push(Prisma.sql`A.key = ${key}`)
  }
  const where = searchCondition.length ? 
    Prisma.sql`where ${Prisma.join(searchCondition, ' AND ')}` : Prisma.empty

    const insightMaster = await prisma.$queryRaw`
    SELECT 
      *
    FROM 
      InsightMaster A 
    ${where}
      `;

  res.status(200).json({
    insightMaster
  });
}
