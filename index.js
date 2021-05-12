const express = require("express");
var sgMail = require("@sendgrid/mail");
const fs = require("fs");
const path = require("path");
const async = require("async");
const sgClient = require("@sendgrid/client");
const port = 8000 || process.env.port;
const app = express();
const cors = require("cors");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
//for substitution
sgMail.setSubstitutionWrappers("{", "}");
const API_KEY1 = process.env.sendGrid_API_Key;
sgMail.setApiKey(API_KEY1);
sgClient.setApiKey(API_KEY1);
//funtion to retrieve email which not sent successfully
const RetriveInvalidEmails = (res, Emails) => {
  const request = {
    method: "GET",
    url: "/v3/suppression/bounces",
  };
  const reqDelete = {
    body: { delete_all: true },
    method: "DELETE",
    url: request.url,
    json: true,
  };
  sgClient
    .request(request)
    .then(async ([response, body]) => {
      console.log(response.statusCode);
      console.log(body);
      await body.map(async (data) => {
        let x = await Emails.findIndex((i) => {
          return i == data.email;
        });
        console.log(x);
        if (x !== -1) {
          Emails.splice(x, 1);
          console.log(Emails);
        }
      });
      sgClient.request(reqDelete);
      console.log("hello");
      return res.json(200, {
        status: 200,
        message:
          "WARNING: Since SendGrid's API is Asynchronus in nature, so list of success and failure emails may not be accurate",
        data: {
          success: Emails,
          failure: body,
        },
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
};
//handle post request send by user
app.post("/", async (req, res) => {
  console.log(req.body);
  let attachments = req.body.attachements.map((file) => {
    console.log(file);
    const pathToAttachment = __dirname + "/" + file.path;
    const attachment = fs.readFileSync(pathToAttachment).toString("base64");
    return {
      content: attachment,
      filename: file.filename,
    };
  });
  let Emails = [];
  let personalizations = [];
  let htmlcontent = req.body.content;
  req.body.Data.map((data) => {
    if (
      Emails.find((i) => {
        return i == data.email;
      })
    ) {
    } else {
      Emails.push(data.email);
    }
    let temp = {
      to: "default@default.com",
      [data.type]: { email: data.email },
      substitutions: {},
    };
    for (let i in data) {
      console.log(i);
      if (i !== "email" && i !== "type") {
        temp.substitutions[i] = data[i];
      }
    }
    console.log(temp.substitutions);
    //push data into personalizations
    personalizations.push(temp);
  });
  const msg = {
    personalizations: personalizations,
    from: "pachory1997@gmail.com", // Change to your verified sender
    subject: "Globalshala backend task",
    html: htmlcontent,
    attachments: attachments,
  };
  try {
    let data = await sgMail.send(msg);
    var current = new Date();
    let minutes = current.getMinutes();
    let i = 0;
    while (new Date().getMinutes() < minutes + 1) {
      continue;
    }
    RetriveInvalidEmails(res, Emails);
  } catch (err) {
    console.log(err);
    return res.json(500, {
      message: "internal server error",
    });
  }
});
//server setup

app.get("/", (req, res, next) => {
  res.send(GetResponse);
});
app.listen(process.env.PORT || port, () => {
  console.log(`SendGrid app listening at http://localhost:${port}`);
});
//utility Get Response
const GetResponse = `<pre>How To Use This API
  1. Method of request must be POST
  2. URL is https://vkswhyglobalshalaintern.herokuapp.com/
  3. Set the headers of request as follows:
      a. 'Accept':'application/json, text/plain, /'
      b. 'Content-Type':'application/json'
  4. Set the body of request, for syntax check the sample.txt</pre>`;
