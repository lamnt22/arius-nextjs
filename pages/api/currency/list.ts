import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const count:any = await prisma.$queryRaw`
    SELECT 
      COUNT(*) AS total
    FROM 
        CurrencyRate
        WHERE
            delete_flag = 0
      ;
  `;

    const currencyRate = await prisma.$queryRaw`
        SELECT 
            *
        FROM 
            CurrencyRate
        WHERE
            delete_flag = 0
            AND date in (SELECT max(date) FROM CurrencyRate)
        ;
    `;

    res.status(200).json({
        currencyRate,
    })
}