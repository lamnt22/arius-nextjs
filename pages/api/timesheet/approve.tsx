import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import moment from "moment";
import { TimeSheetStatus } from "@prisma/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id, date, employee_id, timeSheet_id, time_in, time_out, approve_id, reason, status } = req.body;

    const dateFormat = moment(date).format("YYYY-MM-DD");
    const dateFormatCode = moment(date).format("YYYY/MM/DD");
    const dateParse = moment(date).format("DD/MM/YYYY");

    const timeDistanceSeconds = (date1: any, date2: any) => {
        let distance = Math.abs(date1 - date2);
        const hours = Math.floor(distance / 3600000);
        distance -= hours * 3600000;
        const minutes = Math.floor(distance / 60000);
        distance -= minutes * 60000;
        const seconds = Math.floor(distance / 1000);
        return `${hours}:${('0' + minutes).slice(-2)}:${('0' + minutes).slice(-2)}`;
    };

    const timeDistance = (date1: any, date2: any) => {
        let distance = Math.abs(date1 - date2);
        const hours = Math.floor(distance / 3600000);
        distance -= hours * 3600000;
        const minutes = Math.floor(distance / 60000);
        distance -= minutes * 60000;
        const seconds = Math.floor(distance / 1000);
        return `${hours}:${('0' + minutes).slice(-2)}`;
    };

    const timeTotalHours = (date1: any, date2: any) => {
        let distance = Math.abs(date1 - date2);
        const hours = Math.floor(distance / 3600000);
        distance -= hours * 3600000;
        const minutes = Math.floor(distance / 60000);
        distance -= minutes * 60000;
        const seconds = Math.floor(distance / 1000);
        return `${hours - 1}:${('0' + minutes).slice(-2)}`;
    };

    const timeMsec = (date1: any, date2: any) => {
        const difference = date1 - date2
        return Math.round(difference / 60000);
    }

    const convertTimeIn = new Date(dateFormat + " " + time_in);
    const convertTimeOut = new Date(dateFormat + " " + time_out);

    let totalHours;

    if (moment(time_in, 'HH:mm:ss').format("HH:mm") === moment(time_out, 'HH:mm:ss').format("HH:mm")) {
        totalHours = "00:00";

    } else {
        if (Date.parse(dateFormat + " " + time_in) >= Date.parse(dateFormat + " " + "13:00:00")) {
            totalHours = timeDistance(convertTimeOut, convertTimeIn);

        } else if (Date.parse(dateFormat + " " + time_in) <= Date.parse(dateFormat + " " + "12:00:00")) {
            totalHours = timeTotalHours(convertTimeOut, convertTimeIn);

        } else {
            const totalTotaled = timeDistanceSeconds(convertTimeOut, convertTimeIn);
            const date1 = new Date(dateFormat + " " + moment(time_in, 'HH:mm:ss').format("00:mm:00"));
            const oneHour = new Date(dateFormat + " " + "01:00:00");
            const minutesCal = timeDistanceSeconds(oneHour, date1);
            const convertDate1 = new Date(date + " " + minutesCal);
            const date2 = new Date(dateFormat + " " + totalTotaled);
            totalHours = timeDistance(date2, convertDate1);
        }
    }

    const timeDiff = timeMsec(new Date(dateFormatCode + " " + totalHours).getTime(), new Date(dateFormatCode + " " + "08:00").getTime());


    let statusIn: any;
    let statusOut: any;

    if (Date.parse(dateParse + " " + time_in) > Date.parse(dateParse + " " + "09:30:00")) {
        statusIn = TimeSheetStatus.LATE;

    } else if (Date.parse(dateParse + " " + time_in) < Date.parse(dateParse + " " + "09:30:00")) {
        statusIn = TimeSheetStatus.EARLY;

    } else if (time_in === "--:--:--") {
        statusIn = TimeSheetStatus.MISSING;

    } else {

        statusIn = TimeSheetStatus.OK;
    }

    if (convertTimeOut.getHours() < 18) {
        statusOut = TimeSheetStatus.EARLY;

    } else if (time_out === "--:--:--") {
        statusOut = TimeSheetStatus.MISSING;

    } else {
        statusOut = TimeSheetStatus.OK;
    }


    const timeSheetRequest = await prisma.timeSheet.update({
        where: {
            id: timeSheet_id,
        },
        data: {
            time_in: time_in,
            time_out: time_out,
            total_hours: totalHours,
            diff_hours: Number.isNaN(timeDiff) ? 0 : timeDiff,
            status_in: statusIn,
            status_out: statusOut,
            status: TimeSheetStatus.OPEN
        },
    });
    res.status(200).json(timeSheetRequest);

    const updateStatus = await prisma.timeSheetRequest.update({
        where: {
            id: id,
        },
        data: {
            status: status
        }
    });

    return res.status(200).json("Edit request successfull.");
}