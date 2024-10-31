import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.body;

    let result = true;

    const deleteDepartment = await prisma.department.delete({
        where: {
        id,
        }
    }).catch(() => {
        result = false;
    });

    result ? res.status(200).send(deleteDepartment) : res.status(400).send("Department is not exists");
}