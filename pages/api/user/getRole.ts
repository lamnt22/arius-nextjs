import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const {email} = req.query;

    const getRoleUser: any = await prisma.$queryRaw`
        SELECT 
            A.role AS Role,
            A.employee_id AS employeeId
        FROM 
            User A
        WHERE 
            A.email = ${email}
        ;
    `;


    res.status(200).json({
        getRoleUser: getRoleUser[0].Role,
        getEmployeeId: getRoleUser[0].employeeId
    })
}