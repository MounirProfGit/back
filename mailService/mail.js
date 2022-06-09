//This microservice receives a POST request when the form is sent
// it uses exepresJS for the server part
// it uses nodemailer to connect to the SMTP server and send the email
// it uses pug as an HTML templates for the content of the mail

const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");
const pug = require('pug');
const redis = require('redis');
//We use dotenv to work with env variables, we access them using process.enc.NAME_VARIABLE
require('dotenv').config();
const publisher = redis.createClient();

const templates = [{
            id: '1',
            template: 'template 1',
            content: `h1 welcome #{name} to a new exp
        p #{message}
        `
        },
        {
            id: '2',
            template: 'template 2',
            content: `h1 welcome back #{name}
        p #{message}
        `
        }
    ]
    //bodyParser lets Express know that the data we're usinf is in JSON format
app.use(bodyParser.json());

//we use cors to prevent erros of type cross orign access
app.use(cors())

//when a user sends a get request to this endpoint, he retrievs the email templates info
app.get('/api/mails/templates', (req, res) => {
    res.json(templates);
    console.log('sent');
})

//the user sends a post request with the email infos to send it
app.post('/api/mails', (req, res) => {
    const message =
        //we send a mail using
        sendMail(req.body).then(() => {

            res.json({ 'message': 'mail sent' });

            (async() => {

                await publisher.connect();

                await publisher.publish('mail', JSON.stringify(message));
            })();



        }).catch((err) => {
            res.json({ 'message': `mail failed to send due to`, err });
        });


});

app.listen(process.env.MAINPORT, () => {
    console.log("listening on port", process.env.MAINPORT);
});

async function sendMail(mailInfo) {
    console.log(templates.find(e => e.id == mailInfo.template));
    const template = templates.find(e => e.id == mailInfo.template).content;
    const generated = pug.compile(template);
    let messageToSend = generated({
            name: mailInfo.name,
            message: mailInfo.message
        })
        // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.SMTPHOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PSW,
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'testApplicationDataEnhancers@outlook.fr', // sender address
        to: mailInfo.address, // reciever
        subject: `${mailInfo.subject}  ${mailInfo.name}`, // Subject line
        html: messageToSend, // html body
    });

    console.log("Message sent: %s", info.messageId);


}