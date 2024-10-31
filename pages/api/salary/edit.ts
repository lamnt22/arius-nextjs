import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id,pay_time, employee_id,total_hours,diff_hours,amount, status, description } = req.body;
  const exists = await prisma.employeeSalaryMonthly.findFirst({
    where: {
      employee_id,
      NOT: {
        id
      }
    },
  });
  if (exists) {
    res.status(400).send("Employee salary already exists");
  } else {
    const employeeSalaryMonthly = await prisma.employeeSalaryMonthly.update({
      where: {
        id: id,
      },
      data: {
        pay_time,
        employee_id,
        total_hours,
        diff_hours,
        amount,
        status,
      },
    });
    res.status(200).json(employeeSalaryMonthly);
  }
}
