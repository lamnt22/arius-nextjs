import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { pay_time } = req.query;
    const dateString = `${pay_time}`;
    const arrString:string[] = dateString.split("/");
    
    const count: any = await prisma.$queryRaw`
    SELECT 
      COUNT(*) AS total
    FROM 
        TimeSheet
        GROUP BY MONTH(${pay_time})
      ;
  `;
    const getEmployeeSalaryByMonth: any = await prisma.$queryRaw`
    SELECT 
       SUM(A.diff_hours) AS diff_hours,
       SUM(time_to_sec(A.total_hours) / (60 * 60)) AS total_hours,
       C.employee_id,
       C.salary
       FROM 
           TimeSheet A
           LEFT JOIN Employee B ON B.id = A.employee_id
           LEFT JOIN EmployeeSalary C ON B.id = C.employee_id
        WHERE 
        month(A.date) = ${arrString[0]}
        AND year(A.date) =${arrString[1]}
       GROUP BY month(A.date),year(A.date), C.id
    `;

    for (let i = 0; i < getEmployeeSalaryByMonth.length; i++) {
        const elementI = getEmployeeSalaryByMonth[i];
        const employeeId = elementI.employee_id;
        const dateMonths = `${pay_time}`;
        const getEmployeeId: any = await prisma.$queryRaw`
        SELECT 
            employee_id AS employeeId
            FROM
                EmployeeSalaryMonthly
            WHERE
                employee_id = ${employeeId}
                AND pay_time = ${dateMonths}
        `;

        const getDate: any = await prisma.$queryRaw`
          SELECT 
              A.pay_time
          FROM 
            EmployeeSalaryMonthly A
          WHERE 
              A.pay_time = ${dateMonths}
              AND A.employee_id = ${employeeId}
      `;
      const getId: any = await prisma.$queryRaw`
        SELECT 
            A.id
        FROM 
            EmployeeSalaryMonthly A
        WHERE 
            A.pay_time = ${dateMonths}
            AND A.employee_id = ${employeeId}
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
                  pay_time: dateMonths.toString(),
                  total_hours: Number(elementI.total_hours.toFixed(1)),
                  diff_hours: Number(elementI.diff_hours),
                  amount: Number(amount.toFixed(0))
              },
          });
      } else {
          if (dateMonths.toString() === getDate[0].pay_time && employeeId === getEmployeeId[0].employeeId) {
              for (let k = 0; k < getId.length; k++) {
                  const e = getId[k];
                  
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
          }else {
            await prisma.employeeSalaryMonthly.create({
                data: {
                    employee_id: Number(elementI.employee_id),
                    pay_time: dateMonths.toString(),
                    total_hours: Number(elementI.total_hours.toFixed(1)),
                    diff_hours: Number(elementI.diff_hours),
                    amount: Number(amount.toFixed(0))
                },
            });
          }
      }

  }
    }
    return res.status(200).json("Caculate salary successful.");
}