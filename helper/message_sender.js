const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const sendSms = (contact, message) => {
    return new Promise((resolve,reject)=> {
        console.log(` Your Phone Number is ${contact}`)
        
        client.messages
          .create({
             body: message,
             from: process.env.TWILIO_PHONE_NUMBER,
             to: contact
           })
          .then(message => resolve(message.sid))
          .catch(e=>reject(e));
    })
}

module.exports = sendSms;