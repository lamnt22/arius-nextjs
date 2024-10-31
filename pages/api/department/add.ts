import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { name, manager} = req.body;

    const exists = await prisma.department.findFirst({
        where: {
            name,
        },
    });

    if(exists) {
        res.status(400).send("Department already exists");
    }else {
        const department = await prisma.department.create({
            data: {
                name: name,
                manager: Number(manager)
            }
        });
        res.status(200).send(department)
    }
}