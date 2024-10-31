import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { keyword, page } = req.query;

  console.log("keyword: ", keyword);
  const query = `%${keyword}%`;
  
  const maxResults = BigInt(20);

  let offset = BigInt(Number(page) - 1)*maxResults;

  const count:any = await prisma.$queryRaw`
    SELECT 
      COUNT(*) AS total
    FROM 
      Customer
    WHERE 
      name LIKE ${query}
      AND delete_flag = 0
      ;
  `;

  const customers = await prisma.$queryRaw<{ id: number }[]>`
    SELECT 
      * 
    FROM 
      Customer
    WHERE 
      name LIKE ${query}
      AND delete_flag = 0
    LIMIT ${offset}, ${maxResults}
      ;
  `;

  res.status(200).json({
    customers,
    total: Number(count[0].total),
    maxResults: Number(maxResults)
  });
}
