import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { fromMonth, page } = req.query;
    const dateStr = `${fromMonth}`

    const arrString: string[] = dateStr.split("/");

    const listHoliday: any = await prisma.$queryRaw`
        SELECT
            DATE_FORMAT(A.date, "%e") AS date
        FROM 
            Holiday A
        WHERE 
            A.delete_flag = 0
            AND MONTH(A.date) = ${arrString[0]}
        ;
    `;

    const isWeekday = (year: any, month: any, day: any) => {
        const days = new Date(year, month, day).getDay();
        return days != 0 && days != 6;
    }

    const isHoliday = (year: any, month: any, day: any) => {
        const dates = new Date(year, month, day).getDate();
        let checkHoliday = true;
        for (let i = 0; i < listHoliday.length; i++) {
            const element = listHoliday[i].date;
            if(element == dates){
                checkHoliday = false;
            }
        }
        return checkHoliday;
    }

    const daysInMonth = (iMonth: any, iYear: any) => {
        return new Date(iYear, iMonth, 0).getDate();
    }

    const getWeekdaysInMonth = (month: any, year: any) => {
        const days = daysInMonth(month, year);

        let weekdays = 0;
        for (let i = 0; i < days; i++) {
            if (isWeekday(year, month, i + 1) && isHoliday(year, month, i + 1))
                weekdays++;
        }
        return weekdays;
    }

    
    const getMonth = new Date(arrString[1] + "-" + arrString[0] + "-01").getMonth();
    console.log(getWeekdaysInMonth(getMonth, Number(arrString[1])));


    const maxResults = BigInt(20);

    let offset = BigInt(Number(page) - 1) * maxResults;

    const count: any = await prisma.$queryRaw`
    SELECT 
        COUNT(DISTINCT B.name) AS total
    FROM 
        TimeSheet A
        LEFT JOIN Employee B ON B.id = A.employee_id
        WHERE 
            month(A.date) = ${arrString[0]}
            AND year(A.date) =${arrString[1]}
      ;
  `;

    const getListbyMemeber: any = await prisma.$queryRaw`
        SELECT 
            SUM(time_to_sec(A.total_hours) / (60 * 60)) AS total_hours,
            B.name
            FROM 
                TimeSheet A
                LEFT JOIN Employee B ON B.id = A.employee_id
                WHERE 
                month(A.date) = ${arrString[0]}
                AND year(A.date) =${arrString[1]}
            GROUP BY month(A.date),year(A.date), B.id
            LIMIT ${offset}, ${maxResults}
        ;
    `;


    res.status(200).json({
        getListbyMemeber,
        total: Number(count[0].total),
        maxResults: Number(maxResults),
        totalHoursMonth: Number(getWeekdaysInMonth(getMonth, Number(arrString[1]))) * 8
    })
}