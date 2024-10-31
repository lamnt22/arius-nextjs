import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page } = req.query;
  
  const maxResults = BigInt(20);

  let offset = BigInt(Number(page) - 1)*maxResults;

  const count:any = await prisma.$queryRaw`
    SELECT 
      COUNT(*) AS total
    FROM 
      InsightMaster
    WHERE 
      delete_flag = 0
      ;
  `;

  const insightMaster = await prisma.$queryRaw`
    SELECT 
      * 
    FROM 
      InsightMaster
    WHERE 
      delete_flag = 0
    LIMIT ${offset}, ${maxResults}
      ;
  `;

  res.status(200).json({
    insightMaster,
    total: Number(count[0].total),
    maxResults: Number(maxResults)
  });
}
