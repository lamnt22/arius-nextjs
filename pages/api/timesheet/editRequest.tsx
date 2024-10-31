import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import moment from "moment";
import { TimeSheetStatus } from "@prisma/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id, date, employee_id, timeSheet_id, time_in, time_out, approve_id, reason, status } = req.body;



    if (status === "REJECTED") {
        await prisma.timeSheet.update({
            where: {
                id: timeSheet_id,
            },
            data: {
                status: TimeSheetStatus.OPEN
            }
        });
        await prisma.timeSheetRequest.update({
            where: {
                id: id,
            },
            data: {
                status: status
            },

        })
    } else {
        await prisma.timeSheetRequest.update({
            where: {
                id: id,
            },
            data: {
                employee_id,
                timeSheet_id,
                time_in,
                time_out,
                approve_id,
                reason
            },

        })
    }



    return res.status(200).json("Edit request successfull.");
}