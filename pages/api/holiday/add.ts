import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {date, description} = req.body;
    
    const exists = await prisma.holiday.findFirst({
    where: {
        date: date,
    },
    });
    if (exists) {
    res.status(400).send("Member already exists");
    } else {
        const holiday = await prisma.holiday.create({
            data: {
                date: date,
                description: description
            },
        });

        res.status(200).json(holiday);
    }
}