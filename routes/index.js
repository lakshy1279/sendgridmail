const express = require("express");
var sgMail = require("@sendgrid/mail");
const fs = require("fs");
const path = require("path");
const async = require("async");
const API_KEY1 =
  "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";
sgMail.setApiKey(API_KEY1);
const router = express.Router();
router.get("/", (req, res) => {
  const pathToAttachment = `${__dirname}/attachment.pdf`;
  const attachment = fs.readFileSync(pathToAttachment).toString("base64");
  const errorEmails = [];
  const successfulEmails = [];
  const msg = {
    // to: ["pachory1997@gmail.com", "harivendrakumarsharma1845@gmail.com"], // Change to your recipient
    personalizations: [
      {
        to: [
          {
            email: "pachory1997@gmail.com",
          },
        ],
        cc: [
          {
            email: "harivendrakumarsharma1845@gmail.com",
          },
        ],
        bcc: [
          {
            email: "luckyron1279@gmail.com",
          },
        ],
      },
    ],
    from: "luckyron1279@gmail.com", // Change to your verified sender
    subject: "Sending with SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    attachments: [
      {
        content: attachment,
        filename: "attachment.pdf",
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  };

  sgMail
    .send(msg)
    .then((data) => {
      return res.status(200).json({
        data: {
          data: data,
          errorEmails,
          successfulEmails,
        },
        message: "messege sent",
      });
      console.log("Email sent");
    })
    .catch((error) => {
      console.log(error);
    });
});
// router.use("/v2", require("./v2"));
module.exports = router;
