import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {name, code, customerId, departmentId, startDate, endDate, projectManagerId, cost, costBudget, status, currency, description } = req.body;
  const exists = await prisma.employee.findFirst({
    where: {
      name,
    },
  });
  if (exists) {
    res.status(400).send("Project already exists");
  } else {
    const project = await prisma.project.create({
      data: {
        name: name,
        code: code,
        customer_id: Number(customerId),
        department_id: Number(departmentId),
        start_date: startDate,
        end_date: endDate,
        project_manager_id: Number(projectManagerId),
        cost: Number(cost),
        cost_budget: Number(costBudget),
        status: status,
        currency: currency,
        description: description
      },
    });

    res.status(200).json(project);
  }
}
