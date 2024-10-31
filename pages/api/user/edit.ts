import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id, username, email, role,password,confirmPassword, employee_id } = req.body;

    const exists = await prisma.user.findFirst({
        where: {
            username,
            email,
            NOT: {
                id
            }
        },
    });
    const getPassword: any = await prisma.$queryRaw`
        SELECT 
            password
        FROM 
            User
            WHERE 
                id = ${id}
    `;

    if(exists) {
        res.status(400).send("User already exists");
    }else {
        if(confirmPassword !== password){
            res.status(400).send("Confirm password is not match")
        }else {
            if(getPassword[0].password === password) {
                const user = await prisma.user.update({
                    where: {
                        id: id,
                    },
                    data : {
                        username: username,
                        email: email,
                        role: role,
                        employee_id: Number(employee_id),
                        password: password
                    },
                });
                res.status(200).json(user);
            }else {
                const user = await prisma.user.update({
                    where: {
                        id: id,
                    },
                    data : {
                        username: username,
                        email: email,
                        role: role,
                        employee_id: Number(employee_id),
                        password: await hash(password, 10)
                    },
                });
                res.status(200).json(user);
            }
        }
    }
}