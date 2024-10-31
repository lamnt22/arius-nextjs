import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, name, code, position, birthday, salary, phone, address, status, description } = req.body;

  const exists = await prisma.employee.findFirst({
    where: {
      code,
      NOT: {
        id
      }
    },
  });
  if (exists) {
    res.status(400).send("Member already exists");
  } else {
    const member = await prisma.employee.update({
      where: {
        id: id,
      },
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

    const employeeSalaryExists = await prisma.employeeSalary.findFirst({
      where: {
        employee_id: id,
      },
    });
    if (employeeSalaryExists) {
      const employeeSalary = await prisma.employeeSalary.update({
        where: {
          id: employeeSalaryExists.id
        },
        data: {
          salary: Number(salary),
        },
      });
    } else {
      const employeeSalary = await prisma.employeeSalary.create({
        data: {
          employee_id: id,
          salary: Number(salary),
        },
      });
    }

    res.status(200).json(member);
  }
}
