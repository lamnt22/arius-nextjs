import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.body;

    let result = true;

    const deleteUser = await prisma.user.delete({
        where: {
        id,
        }
    }).catch(() => {
        result = false;
    });

    result ? res.status(200).send(deleteUser) : res.status(400).send("User is not exists");
}