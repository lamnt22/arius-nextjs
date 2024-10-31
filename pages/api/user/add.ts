import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { username, email, password,confirmPassword, role, employee_id } = req.body;

    const exists = await prisma.user.findFirst({
        where: {
            username,
        },
    });
    if (exists) {
        res.status(400).send("Member already exists");
    } else {
        if(confirmPassword !== password){
            res.status(400).send("Confirm password is not match")
        }else {
            const user = await prisma.user.create({
                data: {
                    username: username,
                    email: email,
                    password: await hash(password, 10),
                    role: role,
                    employee_id: Number(employee_id)
                },
            });
           res.status(200).json(user); 
        }
    }
}