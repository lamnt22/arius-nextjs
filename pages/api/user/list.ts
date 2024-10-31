import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const {keyword, page} = req.query;
    const query = `%${keyword}%`;
    console.log(query);
    
    const searchConditions: Prisma.Sql[] = []
    searchConditions.push(Prisma.sql`A.delete_flag = 0`)

    if (keyword) {
        searchConditions.push(Prisma.sql`(B.name LIKE ${query} OR A.username LIKE ${query} OR A.email LIKE ${query})`)
    }

    const where = searchConditions.length ?
        Prisma.sql`where ${Prisma.join(searchConditions, ' AND ')}` : Prisma.empty

    
    const maxResults = BigInt(20);

    let offset = BigInt(Number(page) - 1)* maxResults;

    const count:any = await prisma.$queryRaw`
        SELECT 
        COUNT(*) AS total
        FROM 
            User A
            LEFT JOIN Employee B ON B.id = A.employee_id
            ${where}
        ;
    `;

    const listUser = await prisma.$queryRaw`
        SELECT 
            A.id,
            A.employee_id,
            B.name,
            A.username,
            A.email,
            A.role,
            A.lock_flag,
            A.password
        FROM 
            User A
            LEFT JOIN Employee B ON B.id = A.employee_id
            ${where}
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
        listUser,
        listMember,
        total: Number(count[0].total),
        maxResults: Number(maxResults),
    })
}