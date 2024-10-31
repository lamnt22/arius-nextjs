import prisma from "@/lib/prisma";
import { TimeSheetStatus } from "@prisma/client";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const timeMsec = (date1: any, date2: any) => {
        const difference = date1 - date2
        return Math.round(difference / 60000);
    }
    let timeDiff;
    let statusIn: any;
    let statusOut: any;


    const timeSheet: any = await prisma.$queryRaw`
        SELECT 
            A.id,
            A.employee_id,
            A.date,
            DATE_FORMAT(A.date, "%Y/%m/%d") AS dateFormat,
            A.total_hours AS totalHours,
            A.time_in,
            A.time_out
        FROM 
            TimeSheet A
        WHERE 
            A.delete_flag = 0
        ;
    `;

    const listHoliday: any = await prisma.$queryRaw`
        SELECT
            DATE_FORMAT(A.date, "%Y/%m/%d") AS date
        FROM 
            Holiday A
        WHERE 
            A.delete_flag = 0
        ;
    `;

    const workStart: any = await prisma.$queryRaw`
        SELECT 
            A.value 
        FROM 
            InsightMaster A
        WHERE 
            A.key = 'work_regular_start'
    `;

    const workEnd: any = await prisma.$queryRaw`
        SELECT 
            A.value 
        FROM 
            InsightMaster A
        WHERE 
            A.key = 'work_regular_end'
    `;

    for (let i = 0; i < timeSheet.length; i++) {
        const element = timeSheet[i];
        const id = element.id;
        const dateFormat = element.dateFormat;
        const totalHours = element.totalHours.length === 4 ? "0" + element.totalHours : element.totalHours;
        const timeIn = element.time_in;
        const timeOut = element.time_out;


        if (moment(dateFormat).format("dddd") === "Sunday" || moment(dateFormat).format("dddd") === "Saturday") {
            timeDiff = 0;
        } else {
            timeDiff = timeMsec(new Date(dateFormat + " " + totalHours).getTime(), new Date(dateFormat + " " + "08:00").getTime());
        }

        if (moment(dateFormat).format("dddd") === "Sunday" || moment(dateFormat).format("dddd") === "Saturday") {
            statusIn = TimeSheetStatus.OK;
        } else {
            if (timeIn > workStart[0].value + ":59") {
                statusIn = TimeSheetStatus.LATE;

            } else if (timeIn < workStart[0].value + ":00") {
                statusIn = TimeSheetStatus.EARLY;

            } else if (timeIn === "0") {
                statusIn = TimeSheetStatus.MISSING;

            } else {
                statusIn = TimeSheetStatus.OK;
            }
        }


        if (moment(dateFormat).format("dddd") === "Sunday" || moment(dateFormat).format("dddd") === "Saturday") {
            statusOut = TimeSheetStatus.OK;
        } else {
            if (timeOut < workEnd[0].value + ":00") {
                statusOut = TimeSheetStatus.EARLY;

            } else if (timeOut === "0") {
                statusOut = TimeSheetStatus.MISSING;

            } else {
                statusOut = TimeSheetStatus.OK;
            }
        }
        if (listHoliday != null && listHoliday.length > 0) {
            for (let h = 0; h < listHoliday.length; h++) {
                const holiday = listHoliday[h].date;
                if (holiday === dateFormat) {

                    await prisma.timeSheet.update({
                        where: {
                            id: Number(id),
                        },
                        data: {
                            diff_hours: 0,
                            status_in: TimeSheetStatus.OK,
                            status_out: TimeSheetStatus.OK
                        },
                    })

                } else {

                    await prisma.timeSheet.update({
                        where: {
                            id: Number(id)
                        },
                        data: {
                            diff_hours: Number.isNaN(timeDiff) ? 0 : timeDiff,
                            status_in: statusIn,
                            status_out: statusOut
                        },
                    })

                }
            }
        } else {
            await prisma.timeSheet.update({
                where: {
                    id: Number(id)
                },
                data: {
                    diff_hours: Number.isNaN(timeDiff) ? 0 : timeDiff,
                    status_in: statusIn,
                    status_out: statusOut
                },
            })
        }
    }

    return res.status(200).json("Caculate time sheet successful.");

}