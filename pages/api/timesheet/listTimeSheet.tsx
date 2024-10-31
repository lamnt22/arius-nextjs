import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { keyword, timeId, page } = req.query;

    const query = `${keyword}`;
    const maxResults = BigInt(20);

    let offset = BigInt(Number(page) - 1) * maxResults;

    const timeSheet = await prisma.$queryRaw`
    SELECT 
      *
    FROM 
        TimeSheet 
    WHERE
        id = ${timeId}
    `;

    const getEmployeeByRole = await prisma.$queryRaw`
        SELECT 
        * 
        FROM 
        Employee
        WHERE
            position = 'PROJECT_MANAGER'
        ;
    `;

    const getRequestByid = await prisma.$queryRaw`
        SELECT 
        *
        FROM 
            TimeSheetRequest 
        WHERE
            timeSheet_id = ${timeId}
            AND status = 'REQUEST'
        ;
    `;

    
    const getTimeSheetRequest: any = await prisma.$queryRaw<{ id: number }[]>`
    SELECT 
            A.id,
            A.employee_id,
            B.name,
            A.time_in,
            A.time_out,
            A.total_hours,
            A.diff_hours,
            A.status_in,
            A.status_out,
            DATE_FORMAT(A.date, "%Y/%m/%d") AS date,
            DATE_FORMAT(A.date, "%d/%m/%Y") AS dateParse,
            A.ot_hours,
            C.id AS requestId,
            C.time_in AS timeIn,
            C.time_out AS timeOut,
            C.approve_id,
            C.reason,
            A.status
        FROM 
            TimeSheet A
            LEFT JOIN Employee B ON B.id = A.employee_id
            LEFT JOIN TimeSheetRequest C ON C.timeSheet_id = A.id 
            WHERE C.status = 'REQUEST'
            AND A.employee_id = ${query}
            LIMIT ${offset}, ${maxResults}
    ;
    `;

    const countRequest: any = await prisma.$queryRaw`
        SELECT 
            COUNT(*) AS totalRequest
        FROM 
            TimeSheetRequest A 
            WHERE A.status = 'REQUEST'
            AND A.employee_id = ${query}
        ;
    `;

    res.status(200).json({
        timeSheet,
        getTimeSheetRequest,
        getEmployeeByRole,
        getRequestByid,
        totalRequest: Number(countRequest[0].totalRequest)
      });
  }