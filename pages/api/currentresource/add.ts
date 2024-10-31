import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {employeeId,resource_allocation_id, date, planEffort, remainEffort, description } = req.body;

  const currentResource = await prisma.currentResource.create({
    data: {
      employee_id: Number(employeeId),
      resource_allocation_id: Number(resource_allocation_id),
      date: date,
      plan_effort: Number(planEffort),
      remain_effort: Number(remainEffort),
      description: description
    },
  });
  
  res.status(200).json({
    currentResource,
  })
}
