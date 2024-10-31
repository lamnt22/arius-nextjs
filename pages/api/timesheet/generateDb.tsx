import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path"
import csvtojson from "csvtojson";
import moment from "moment";
import { TimeSheetStatus } from "@prisma/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const fs = require('fs-extra');
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

    const csvData = await csvtojson().fromFile(path.join(process.cwd() + "/public/files/" + new Date().toISOString().split('T')[0] + ".csv"));

    for (let i = 0; i < csvData.length; i++) {
        const csvLine = csvData[i];

        const date1 = csvLine["Date"].split('/')
        const newDate = date1[2] + "-" + date1[0] + "-" + date1[1];
        const dateFormat = date1[2] + "/" + date1[0] + "/" + date1[1];
        const date = new Date(newDate);
        const dateParse = date1[1] + "/" + date1[0] + "/" + date1[2];
       
        
        const convertTimeIn = new Date(newDate + " " + csvLine["First In Time"]);
        const convertTimeOut = new Date(newDate + " " + csvLine["Last Out Time"]);

        let totalHours;
        let timeDiff;
        let statusIn: any;
        let statusOut: any;

        if (moment(csvLine["First In Time"], 'HH:mm:ss').format("HH:mm") === moment(csvLine["Last Out Time"], 'HH:mm:ss').format("HH:mm")) {
            totalHours = "00:00";

        }else if(csvLine["First In Time"] === "--:--:--" || csvLine["Last Out Time"] === "--:--:--" ){
            totalHours = "00:00";
        }else {
            if (Date.parse(newDate + " " + csvLine["First In Time"]) >= Date.parse(newDate + " " + "13:00:00")) {
                totalHours = timeDistance(convertTimeOut, convertTimeIn);

            } else if (Date.parse(newDate + " " + csvLine["First In Time"]) <= Date.parse(newDate + " " + "12:00:00")) {
                totalHours = timeTotalHours(convertTimeOut, convertTimeIn);

            } else {
                const totalTotaled = timeDistanceSeconds(convertTimeOut, convertTimeIn);
                const date1 = new Date(newDate + " " + moment(csvLine["First In Time"], 'HH:mm:ss').format("00:mm:00"));
                const oneHour = new Date(newDate + " " + "01:00:00");
                const minutesCal = timeDistanceSeconds(oneHour, date1);
                const convertDate1 = new Date(newDate + " " + minutesCal);
                const date2 = new Date(newDate + " " + totalTotaled);
                totalHours = timeDistance(date2, convertDate1);
            }
        }
        
        if(moment(dateFormat).format("dddd") === "Sunday" || moment(dateFormat).format("dddd") === "Saturday"){
            timeDiff = 0;
        }else {
            timeDiff = timeMsec(new Date(dateFormat + " " + totalHours).getTime(), new Date(dateFormat + " " + "08:00").getTime());
        }
         

        const employee_id = csvLine["Employee ID/ User Name"];
        const code: string[] = employee_id.split(" ");

        

        if(moment(dateFormat).format("dddd") === "Sunday" || moment(dateFormat).format("dddd") === "Saturday"){
            statusIn = TimeSheetStatus.OK;
        }else {
            if (csvLine["First In Time"] >  workStart[0].value + ":59") {
                statusIn = TimeSheetStatus.LATE;
    
            } else if (csvLine["First In Time"] <  workStart[0].value + ":00") {
                statusIn = TimeSheetStatus.EARLY;
    
            } else if (csvLine["First In Time"] === "--:--:--") {
                statusIn = TimeSheetStatus.MISSING;
    
            } else {
                statusIn = TimeSheetStatus.OK;
            }
        }
        

        if(moment(dateFormat).format("dddd") === "Sunday" || moment(dateFormat).format("dddd") === "Saturday"){
            statusOut = TimeSheetStatus.OK;
        }else {
            if (csvLine["Last Out Time"]  < workEnd[0].value + ":00") {
                statusOut = TimeSheetStatus.EARLY;
    
            } else if (csvLine["Last Out Time"] === "--:--:--") {
                statusOut = TimeSheetStatus.MISSING;
    
            }else {
                statusOut = TimeSheetStatus.OK;
            }
        }
        



        const getEmployeeIdByCode: any = await prisma.$queryRaw`
        SELECT 
            id AS employeeId
            FROM
            Employee
            WHERE
                code = ${code[0]}
        `;
        if(listHoliday != null && listHoliday.length > 0){
            for (let h = 0; h < listHoliday.length; h++) {
                const holiday = listHoliday[h].date;
                if(holiday === dateFormat){
                    timeDiff =0;
                    statusIn = TimeSheetStatus.OK;
                    statusOut = TimeSheetStatus.OK;
                }
            }
        }

        for (let index = 0; index < getEmployeeIdByCode.length; index++) {
            const employee = getEmployeeIdByCode[index];
            const getEmployeeId: any = await prisma.$queryRaw`
            SELECT 
                employee_id AS employeeId
                FROM
                TimeSheet
                WHERE
                    employee_id = ${employee.employeeId}
                    AND date = ${newDate}
            `;

            const getDate: any = await prisma.$queryRaw`
                SELECT 
                    DATE_FORMAT(A.date, "%d/%m/%Y") AS dates
                FROM 
                    TimeSheet A
                WHERE 
                    A.date = ${newDate}
                    AND A.employee_id = ${employee.employeeId}
            `;

            const getId: any = await prisma.$queryRaw`
                SELECT 
                    A.id
                FROM 
                    TimeSheet A
                WHERE 
                    A.date = ${newDate}
                    AND A.employee_id = ${employee.employeeId}
            `;

            const getStatus: any = await prisma.$queryRaw`
                SELECT 
                    A.status 
                FROM 
                    TimeSheet A
                WHERE 
                    A.date = ${newDate}
                    AND A.employee_id = ${employee.employeeId}
                `;

            
            if (getDate[0] === undefined || getEmployeeId[0] === undefined) {

                await prisma.timeSheet.create({
                    data: {
                        date: date,
                        employee_id: employee.employeeId,
                        time_in: csvLine["First In Time"] === "--:--:--" ? "0" : csvLine["First In Time"],
                        time_out: csvLine["Last Out Time"] === "--:--:--" ? "0" : csvLine["Last Out Time"],
                        total_hours: totalHours,
                        diff_hours: Number.isNaN(timeDiff) ? 0 : timeDiff,
                        status_in: statusIn,
                        status_out: statusOut
                    },
                });

            } else {
                if (employee.employeeId === getEmployeeId[0].employeeId && dateParse === getDate[0].dates && getStatus[0].status === "OPEN") {
                    for (let j = 0; j < getId.length; j++) {
                        const e = getId[j];

                        await prisma.timeSheet.update({
                            where: {
                                id: Number(e.id)
                            },
                            data: {
                                time_in: csvLine["First In Time"] === "--:--:--" ? "0" : moment(convertTimeIn).format("HH:mm:ss"),
                                time_out: csvLine["Last Out Time"] === "--:--:--" ? "0" : moment(convertTimeOut).format("HH:mm:ss"),
                                total_hours: totalHours,
                                diff_hours: Number.isNaN(timeDiff) ? 0 : timeDiff,
                                status_in: statusIn,
                                status_out: statusOut
                            },
                        })
                    }
                }
            }
        }

    }

    fs.removeSync(path.join(process.cwd() + "/public","/files"));

    return res.status(200).json("Import successful.");
}