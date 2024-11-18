const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    // user: "techinalhamza@gmail.com",
    // pass: "kard yokk rdbi cyos",
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: '"Charcuterie Templates" techinalhamza@gmail.com',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
