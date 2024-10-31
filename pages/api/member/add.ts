import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {name, code, position, birthday, salary, phone, address, status, description } = req.body;
  const exists = await prisma.employee.findFirst({
    where: {
      code,
    },
  });
  if (exists) {
    res.status(400).send("Member already exists");
  } else {
    const employee = await prisma.employee.create({
      data: {
        name: name,
        code: code,
        position: position,
        birthday: birthday,
        phone: phone,
        address: address,
        status: status,
        description: description
      },
    });

    const employeeSalary = await prisma.employeeSalary.create({
      data: {
        employee_id: employee.id,
        salary: Number(salary),
      },
    });

    res.status(200).json(employee);
  }
}
