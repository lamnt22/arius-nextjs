import prisma from "@/lib/prisma";
import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { requestDate, requestMonth } = req.query;
  const searchConditionExpense: Prisma.Sql[] = []
  searchConditionExpense.push(Prisma.sql`A.delete_flag = 0`)
  if (requestDate) {
    searchConditionExpense.push(Prisma.sql`year(A.request_date) = ${requestDate}`)
  }
  if (requestMonth) {
    searchConditionExpense.push(Prisma.sql`month(A.request_date) = ${requestMonth}`)
  }

  const whereExpense = searchConditionExpense.length ?
    Prisma.sql`where ${Prisma.join(searchConditionExpense, ' AND ')}` : Prisma.empty

  const searchConditionIncome: Prisma.Sql[] = []
  searchConditionIncome.push(Prisma.sql`A.delete_flag = 0`)
  if (requestDate) {
    searchConditionIncome.push(Prisma.sql`year(A.income_date) = ${requestDate}`)
  }
  if (requestMonth) {
    searchConditionIncome.push(Prisma.sql`month(A.income_date) = ${requestMonth}`)
  }

  const whereIncome = searchConditionIncome.length ?
    Prisma.sql`where ${Prisma.join(searchConditionIncome, ' AND ')}` : Prisma.empty

  const sumAmount = await prisma.$queryRaw`
    SELECT 
      sum(A.amount) AS sumAmount,
      A.type
    FROM 
      Expense A
    ${whereExpense}
    Group By 
      A.type
      ;
  `;

  const sumAmountAllType = await prisma.$queryRaw`
    SELECT 
      sum(A.amount) AS sumAmount
    FROM 
      Expense A
    ${whereExpense}
      ;
  `;

  const sumIncome = await prisma.$queryRaw`
    SELECT 
      sum(A.amount) AS sumAmount
    FROM 
      Income A
    ${whereIncome}
      ;
  `;

  const expenseBudgets = await prisma.$queryRaw`
    SELECT 
      * 
    FROM 
      ExpenseBudget
    WHERE 
      delete_flag = 0
      ;
  `;

  res.status(200).json({
    sumAmount,
    sumIncome,
    expenseBudgets,
    sumAmountAllType
  });
}
