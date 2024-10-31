import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {page} = req.query;

    
    const maxResults = BigInt(20);

    let offset = BigInt(Number(page) - 1)* maxResults;

    const count:any = await prisma.$queryRaw`
    SELECT 
      COUNT(*) AS total
    FROM 
        Holiday
        WHERE   
            delete_flag = 0
      ;
  `;

    const listHoliday = await prisma.$queryRaw<{id:number}[]>`
        SELECT
            *
        FROM 
            Holiday
        WHERE 
            delete_flag = 0
            ORDER BY id DESC
            LIMIT ${offset}, ${maxResults}
        ;
    `;

    res.status(200).json({
        listHoliday,
        total: Number(count[0].total),
        maxResults: Number(maxResults)
    })
}