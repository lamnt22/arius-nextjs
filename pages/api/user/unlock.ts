import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id, lock_flag } = req.body;

    const user = await prisma.user.update({
        where: {
            id: id,
        },
        data: {
            lock_flag: lock_flag
        },
    });
    res.status(200).json(user);

}