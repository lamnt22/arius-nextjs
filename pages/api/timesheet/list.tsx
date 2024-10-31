import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { keyword, fromMonth, page } = req.query;
    
    const convert =(str:any) => {
        if(str === null){
            return null;
        }else{
            const dateString = `${fromMonth}`;
            const arrString:string[] = dateString.split("/");
            return arrString[0]
        }
      }
      
    const query = `${keyword}`;
    const searchConditions: Prisma.Sql[] = []
    searchConditions.push(Prisma.sql`A.delete_flag = 0`)
    if(fromMonth){
        searchConditions.push(Prisma.sql`month(A.date) = ${convert(fromMonth)}`)
    }
    if (keyword) {
        searchConditions.push(Prisma.sql`(A.employee_id = ${query})`)
    }

    const where = searchConditions.length ?
        Prisma.sql`where ${Prisma.join(searchConditions, ' AND ')}` : Prisma.empty

    const maxResults = BigInt(20);

    let offset = BigInt(Number(page) - 1) * maxResults;

    const count: any = await prisma.$queryRaw`
    SELECT 
      COUNT(*) AS total
    FROM 
        TimeSheet A
        ${where}
      ;
  `;

    const timeSheet = await prisma.$queryRaw<{ id: number }[]>`
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
            LEFT JOIN TimeSheetRequest C ON C.timeSheet_id = A.id AND C.status = 'REQUEST'
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

    const listTotalHours:any = await prisma.$queryRaw`
        SELECT
            SUM(time_to_sec(A.total_hours) / (60 * 60)) AS sumTotal
        FROM
            TimeSheet A
            LEFT JOIN Employee B ON B.code = A.employee_id
            ${where}
        ;    
    `;

    const countRequest: any = await prisma.$queryRaw`
        SELECT 
            COUNT(*) AS totalRequest
        FROM 
            TimeSheetRequest A
            ${where}
            AND A.status = 'REQUEST'
        ;
    `;

    const listHoliday = await prisma.$queryRaw`
        SELECT
            DATE_FORMAT(A.date, "%Y/%m/%d") AS date
        FROM 
            Holiday A
        WHERE 
            A.delete_flag = 0
        ;
    `;

    const workStart: any = await prisma.$queryRaw`
        SELECT 
            A.value 
        FROM 
            InsightMaster A
        WHERE 
            A.key = 'work_regular_start'
    `;

    const workEnd: any = await prisma.$queryRaw`
        SELECT 
            A.value 
        FROM 
            InsightMaster A
        WHERE 
            A.key = 'work_regular_end'
    `;

    res.status(200).json({
        timeSheet,
        listMember,
        listHoliday,
        listTotalHours: Number(listTotalHours[0].sumTotal).toFixed(1),
        total: Number(count[0].total),
        maxResults: Number(maxResults),
        totalRequest: Number(countRequest[0].totalRequest),
        workStart: workStart[0].value + ":59",
        workEnd: workEnd[0].value + ":00"
    })
}