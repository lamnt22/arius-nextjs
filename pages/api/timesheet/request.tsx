import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { TimeSheetStatus } from "@prisma/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { date, employee_id,timeSheet_id, time_in, time_out, approve_id, reason } = req.body;


    const timeSheetRequest = await prisma.timeSheetRequest.create({
        data: {
            date,
            employee_id,
            timeSheet_id,
            time_in,
            time_out,
            approve_id,
            reason
        },
    });

    const updateStatus = await prisma.timeSheet.update({
        where: {
            id: timeSheet_id,
        },
        data:{
            status: TimeSheetStatus.REQUEST
        }
    })
    return res.status(200).json("Request successfull.");


}