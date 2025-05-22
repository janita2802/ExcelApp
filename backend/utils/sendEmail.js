require("dotenv").config();
const nodemailer = require("nodemailer");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html = null) => {
  const mailOptions = {
    from: `"Excel Tours & Travels" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: html ? null : text, // Send text only if no HTML provided
    html,
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../public/images/logo.png"),
        cid: "companylogo", // Same cid value as in the html img src
        disposition: "inline", // This makes the image display inline rather than as attachment
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
