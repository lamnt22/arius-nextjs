import prisma from "@/lib/prisma";
import { IncomingForm } from 'formidable'

var mv = require('mv');


export const config = {
  api: {
    bodyParser: false,
  }
};

const post = async (req: any, res: any) => {
  const customOptions = { 
    keepExtensions: true, 
    allowEmptyFiles: false, 
    maxFileSize: 5 * 1024 * 1024 * 1024, 
    multiples: true 
  };
  const form = new IncomingForm(customOptions);

  form.parse(req, async function (err, fields, files) {
    console.log("Fields: ", fields);

    let type: any = fields.type[0];
    let deadline = fields.deadline[0];
    let amount = fields.amount[0];
    let currency: any = fields.currency[0];
    let detail = fields.detail[0];
    let status: any = fields.status[0];
    let email = fields.email[0];

    let uploadFiles = files;

    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
  
    if (user) {
      const expense = await prisma.expense.create({
        data: {
          request_date: new Date(),
          deadline: deadline,
          type: type,
          amount: Number(amount),
          currency: currency,
          detail: detail,
          status: status,
          create_by: user.id,
        },
      });
  
      for (var prop in uploadFiles) {
        var file = uploadFiles[prop][0];
  
        var oldPath = file.filepath;
        var newPath = `./public/uploads/expenses/${file.originalFilename}`;
        mv(oldPath, newPath, function(err: any) {});
  
        await prisma.expenseDocument.create({
          data: {
            expense_id: expense.id,
            file: newPath,
            create_by: user.id,
          },
        });
      }
      
      res.status(200).json(expense);
  
    } else {
      res.status(400).send("Access Denied.");
    }
  });

};

export default (req: any, res: any) => {
  req.method === "POST"
    ? post(req, res)
    : req.method === "PUT"
    ? console.log("PUT")
    : req.method === "DELETE"
    ? console.log("DELETE")
    : req.method === "GET"
    ? console.log("GET")
    : res.status(404).send("");
};

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const {type, deadline, amount, currency, detail, status, email } = req.body;

//   console.log("Request Body: ", req.body);

//   const user = await prisma.user.findFirst({
//     where: {
//       email,
//     },
//   });

//   if (user) {
//     const expense = await prisma.expense.create({
//       data: {
//         request_date: new Date(),
//         deadline: deadline,
//         type: type,
//         amount: Number(amount),
//         currency: currency,
//         detail: detail,
//         status: status,
//         create_by: user.id,
//       },
//     });
  
//     res.status(200).json(expense);

//   } else {
//     res.status(400).send("Access Denied.");
//   }
// }
