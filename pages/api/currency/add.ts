import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import moment from 'moment';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {currency, rate, date } = req.body;
  const dateFormat = moment(date).format("YYYY-MM-DD");

  const currencyData: any = await prisma.$queryRaw`
    SELECT 
      A.currency
    FROM 
        CurrencyRate A
    WHERE
        A.currency = ${currency}
        AND A.date= ${dateFormat}
  `;

  const dateData: any = await prisma.$queryRaw`
    SELECT 
      DATE_FORMAT(A.date, "%Y/%m/%d") AS date
    FROM 
        CurrencyRate A
    WHERE
        A.currency = ${currency}
        AND A.date= ${dateFormat}
  `;

  const getId: any = await prisma.$queryRaw`
    SELECT 
      A.id
    FROM 
        CurrencyRate A
    WHERE
        A.currency = ${currency}
        AND A.date= ${dateFormat}
  `;
  // console.log(currencyData[0]);
  

  if(dateData[0] === undefined || currencyData[0] === undefined){
    await prisma.currencyRate.create({
      data: {
        currency: currency,
        rate: rate,
        date: date
      },
    });
      
  }else{
    if(dateData[0].date === moment(date).format("YYYY/MM/DD") && currencyData[0].currency === currency){
      await prisma.currencyRate.update({
        where: {
          id: getId[0].id
        },
        data: {
          rate: rate,
        },
      });
    }
  }
  
  
  return res.status(200).json("Add currency successful.");
}
