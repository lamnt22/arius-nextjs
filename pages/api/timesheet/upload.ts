import { rejects } from "assert";
import formidable from "formidable";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { resolve } from "path";
import fs from "fs/promises"
import fss from "fs"
import path from "path"
import prisma from "@/lib/prisma";
import { useState } from "react";

export const config = {
    api: {
        bodyParser: false,
    },
}

const readFile = (req:NextApiRequest, saveLocally?: boolean)
: Promise<{fields: formidable.Fields; files: formidable.Files}> => {
    const options: formidable.Options = {};
    if(saveLocally){
        options.uploadDir = path.join(process.cwd(), "/public/files");
        options.filename =(name, ext, path, form) =>  {
            return new Date().toISOString().split('T')[0] +".csv";
        }
        
    }
    
    const form = formidable(options)
    return new Promise((resolve, rejects) => {
        form.parse(req, (err, fields, files) => {
            if (err) rejects(err);
            resolve({fields, files});
        });
    });
}
const handler: NextApiHandler = async (req, res) =>{
    try {
        await fs.readdir(path.join(process.cwd() + "/public","/files"));
        
    } catch (error) {
        await fs.mkdir(path.join(process.cwd() + "/public","/files"));
    }
    await readFile(req, true);
    
    res.json({done: 'ok'})
}

export default handler;