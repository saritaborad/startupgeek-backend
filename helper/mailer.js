const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  // requireTLS: true,
  auth: {
    user: process.env.MAIL_AUTH_CREDENTIAL_USER,
    pass: process.env.MAIL_AUTH_CREDENTIAL_PASSWORD,
  },
});

module.exports = async (reciever, sub, message, attachment) => {
  let mailOptions = {
    from: process.env.MAIL_AUTH_CREDENTIAL_USER,
    to: (reciever = reciever),
    subject: sub,
    html: message,
  };

  if (attachment) {
    mailOptions["attachments"] = attachment;
  }

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Message sent: " + JSON.stringify(response));
        resolve(response);
      }
    });
  });
};
