import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id, name, manager} = req.body;

    const exists = await prisma.department.findFirst({
        where: {
            name,
            NOT: {
                id
            }
        },
    });

    if(exists) {
        res.status(400).send("Department already exists");
    }else {
        const department = await prisma.department.update({
            where: {
                id: id,
            },
            data: {
                name: name,
                manager: Number(manager)
            }
        });
        res.status(200).send(department)
    }
}