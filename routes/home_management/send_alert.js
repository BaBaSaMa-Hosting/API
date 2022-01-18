const sgMail = require('@sendgrid/mail')
const dotenv = require('dotenv').config({
    path: '/var/www/Main/API/routes/home_management/twilio.env',
    debug: true
});
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

module.export.send_error = (error, line, file) => {
    const msg = {
        to: 'julong170501@gmail.com',
        from: 'babasama@babasama.com', 
        subject: 'Code Error',
        text: `Error: ${error}, Line: ${line}, File: ${file}`
    }

    sgMail.send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
}