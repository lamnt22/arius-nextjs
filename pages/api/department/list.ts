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
        Department
        WHERE
            delete_flag = 0
      ;
  `;

    const department = await prisma.$queryRaw`
        SELECT 
            A.id,
            A.name,
            A.manager,
            B.name as employee
        FROM 
            Department A
            LEFT JOIN Employee B ON B.id = A.manager
        WHERE
            A.delete_flag = 0
            LIMIT ${offset}, ${maxResults}
        ;
    `;  

    const listMember = await prisma.$queryRaw`
        SELECT 
            *
        FROM 
            Employee  
        ;
    `;

    res.status(200).json({
        department,
        listMember,
        total: Number(count[0].total),
        maxResults: Number(maxResults)
    })
}