import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId, employeeId, position, planEffort, startDate, endDate, description, mm } = req.body;
  
  const resourceAllocation = await prisma.resourceAllocation.create({
    data: {
      project_id: Number(projectId),
      employee_id: Number(employeeId),
      position: position,
      plan_effort: Number(planEffort),
      start_date: startDate,
      end_date: endDate,
      description: description,
      mm: mm
    },
  });
  res.status(200).json({
    resourceAllocation,
  });
}
