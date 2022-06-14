
import { SES } from 'aws-sdk';
import { createTransport } from 'nodemailer';
import { readFileSync } from 'fs';

const ses = new SES({ region: 'ap-northeast-2' });
const transporter = createTransport({ SES: ses })


export async function handler(event, _context) {
    console.log(event);
    const stream = readFileSync('./src/files/text.txt');
    const mailOptions = {
        from: event?.from,
        subject: 'This is an email sent from a Lambda function!',
        html: `<p>You got a contact message from: </p>`,
        to: event?.to,
        attachments: [
            {
                filename: "text.txt",
                content: stream,
            }
        ]
    };

    const id = await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, success) => {
            if (error) reject(error.message);
            resolve(success);
        })
    });

    console.log(`message send success with id ${id}`);
}