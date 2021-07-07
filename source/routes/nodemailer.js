const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "loftnodejstest@gmail.com",
    pass: "loftNodeJs1234"
  }
});

const mailer = message => {
  transporter.sendMail(message, (error, info) => {
    if (error) {
      return console.log(error);
    }
  });
};
module.exports = mailer;
