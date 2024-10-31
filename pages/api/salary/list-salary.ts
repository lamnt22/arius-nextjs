import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {pay_time} = req.body;
    const count: any = await prisma.$queryRaw`
    SELECT 
      COUNT(*) AS total
    FROM 
        TimeSheet
        GROUP BY MONTH(date)
      ;
  `;


    const employeeSalary: any = await prisma.$queryRaw`
         SELECT 
            SUM(A.diff_hours) AS diff_hours,
            SUM(time_to_sec(A.total_hours) / (60 * 60)) AS total_hours,
            B.id AS employee_id,
            C.salary,
            MONTH(A.date) AS months,
            YEAR(A.date) AS years
            FROM 
                TimeSheet A
                LEFT JOIN Employee B ON B.id = A.employee_id
                LEFT JOIN EmployeeSalary C ON B.id = C.employee_id
            GROUP BY MONTH(A.date),YEAR(A.date), B.id, C.id
    `;

    for (let i = 0; i < employeeSalary.length; i++) {
        const elementI = employeeSalary[i];
        const employeeId = elementI.employee_id;
        let dateTime;
        if(elementI.months <10){
             dateTime ="0"+ elementI.months + "/" + elementI.years;
        }else {
             dateTime = elementI.months + "/" + elementI.years;
        }
        
        const getEmployeeId: any = await prisma.$queryRaw`
            SELECT 
                employee_id AS employeeId
                FROM
                EmployeeSalaryMonthly
                WHERE
                    employee_id = ${employeeId}
                    AND pay_time = ${dateTime}
            `;

        const getDate: any = await prisma.$queryRaw`
        SELECT 
            A.pay_time
        FROM 
            EmployeeSalaryMonthly A
        WHERE 
            A. employee_id = ${employeeId}
            AND A.pay_time = ${dateTime}
        `;

        const getId: any = await prisma.$queryRaw`
            SELECT 
                A.id
            FROM 
                EmployeeSalaryMonthly A
            WHERE 
                A. employee_id = ${employeeId}
                AND A.pay_time = ${dateTime}
        `;

        for (let j = 0; j < count.length; j++) {
            const elementJ = count[j];
            const dateOfMonth = Number(elementJ.total) * 8;
            const timeOfMonth = Number(elementI.total_hours.toFixed(1)) / dateOfMonth;
            const amount = timeOfMonth * Number(elementI.salary);
            if (getDate[0] === undefined || getEmployeeId[0] === undefined) {
                await prisma.employeeSalaryMonthly.create({
                    data: {
                        employee_id: Number(elementI.employee_id),
                        pay_time: dateTime,
                        total_hours: Number(elementI.total_hours.toFixed(1)),
                        diff_hours: Number(elementI.diff_hours),
                        amount: Number(amount.toFixed(0))
                    },
                });
            } else {
                if (dateTime === getDate[0].pay_time && employeeId === getEmployeeId[0].employeeId) {
                    for (let j = 0; j < getId.length; j++) {
                        const e = getId[j];

                        await prisma.employeeSalaryMonthly.update({
                            where: {
                                id: Number(e.id)
                            },
                            data: {
                                total_hours: Number(elementI.total_hours.toFixed(1)),
                                diff_hours: Number(elementI.diff_hours),
                                amount: Number(amount.toFixed(0))
                            },
                        });
                    }
                }
            }

        }

    }
    return res.status(200).json("Add successfull.");
}