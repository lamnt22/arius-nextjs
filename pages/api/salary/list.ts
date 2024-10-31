import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {keyword, page} = req.query;
    const query = `%${keyword}%`;
    console.log("keyword: ",keyword);
    
    const maxResults = BigInt(20);

    let offset = BigInt(Number(page) - 1)* maxResults;

    const count:any = await prisma.$queryRaw`
    SELECT 
      COUNT(*) AS total
    FROM 
        EmployeeSalaryMonthly
        WHERE   
            description LIKE ${query}
            AND delete_flag = 0
      ;
  `;

    const employeeSalaryMonthly = await prisma.$queryRaw<{id:number}[]>`
        SELECT 
            A.id,
            B.name,
            A.total_hours,
            A.diff_hours,
            A.amount,
            A.status,
            A.pay_time
        FROM 
            EmployeeSalaryMonthly A
            LEFT JOIN Employee B ON A.employee_id = B.id
            WHERE 
                B.name LIKE ${query}
                AND A.delete_flag = 0
                LIMIT ${offset}, ${maxResults}
        ;
    `;

    res.status(200).json({
        employeeSalaryMonthly,
        total: Number(count[0].total),
        maxResults: Number(maxResults)
    })
}