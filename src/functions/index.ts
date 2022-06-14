
import { SES } from 'aws-sdk';
import { readFileSync } from 'fs';
import * as mimemessage from 'mimemessage';

const ses = new SES({ region: 'ap-northeast-2' });


export async function handler(event, _context) {
    console.log(event);
    const message = mimemessage.factory({
        contentType: 'multipart/mixed',
        body: [],
    });

    message.header('From', `${event.fromName}<${event.from}>`);
    message.header('To', `${event.to}`);
    message.header('Subject', 'This is an email sent from a Lambda function!');

    const alternateEntity = mimemessage.factory({
        contentType: 'multipart/alternate',
        body: []
    });

    const htmlEntity = mimemessage.factory({
        contentType: 'text/html;charset=utf-8',
        body:  '   <html>  '  + 
               '   <head></head>  '  + 
               '   <body>  '  + 
               '   <h1>Hello!</h1>  '  + 
               '   <p>Please see the attached file for a list of    customers to contact.</p>  '  + 
               '   </body>  '  + 
               '  </html>  ' 
      });
     const plainEntity = mimemessage.factory({
        body: 'Please see the attached file for a list of    customers to contact.'
     });
     alternateEntity.body.push(htmlEntity);
     alternateEntity.body.push(plainEntity);
     message.body.push(alternateEntity);

    const stream = readFileSync('./src/files/text.txt');
    const attachmentEntity = mimemessage.factory({
        contentType: 'text/plain',
        contentTransferEncoding: 'base64',
        body: stream.toString('base64').replace(/([^\0]{76})/g, "$1\n")
    });
    attachmentEntity.header('Content-Disposition', 'attachment ;filename="text.txt"');
    message.body.push(attachmentEntity);

    const id = await new Promise((resolve, reject) => {
        ses.sendRawEmail({ RawMessage: { Data: message.toString() }}, (err, data) => {
            if (err) reject(err);
            resolve(data) 
        });
    });

    console.log(`message send success with id ${JSON.stringify(id)}`);
}