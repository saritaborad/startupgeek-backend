const express = require("express");
const fileUpload = require("express-fileupload");
const connectdb = require("./config/db");
require("dotenv").config();
const cors = require("cors");
const errorHandler = require("./middleware/error");
const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(cors());

// connect database
connectdb();

//route files

// common route
const uploadDoc = require("./routes/upload");

// after login
const users = require("./routes/User");
const userPlan = require("./routes/userPlan");
const company = require("./routes/Company");
const contact = require("./routes/Contact");
const director = require("./routes/Director");
const shareholder = require("./routes/Shareholder");
const agent = require("./routes/Agent");
const member = require("./routes/Member");
const taxId = require("./routes/TaxId_num");
const commonroute = require("./routes/common");
const business = require("./routes/Business");
const Billing = require("./routes/Billing");
const addimg = require("./routes/addimgs");
const socialConnect = require("./routes/Connect");
const countryStateCity = require("./routes/country-state-city");

// website
const languages = require("./routes/Languages");
const assistans = require("./routes/Assistans");
const blog = require("./routes/Blog");
const subscribe = require("./routes/Subscriber");

// admin
const admin = require("./routes/Admin");
const mailBox = require("./routes/MailBox");
const pricingPlan = require("./routes/PricingPlan");
const order = require("./routes/Order");
const request = require("./routes/Request");
const document = require("./routes/Document");

// common route
app.use("/upload", uploadDoc);
app.use("/", countryStateCity);

// website
app.use("/lang", languages);
app.use("/assist", assistans);
app.use("/blog", blog);
app.use("/user", subscribe);

// after login
app.use("/api", users);
app.use("/api/social", socialConnect);
app.use("/userPlan", userPlan);
app.use("/company", company);
app.use("/contact", contact);
app.use("/director", director);
app.use("/shareholder", shareholder);
app.use("/agent", agent);
app.use("/member", member);
app.use("/taxid", taxId);
app.use("/common", commonroute);
app.use("/business", business);
app.use("/billing", Billing);
app.use("/addimg", addimg);

//admin
app.use("/admin", admin);
app.use("/admin", subscribe);
app.use("/newsletter", mailBox);
app.use("/admin/company", mailBox);
app.use("/admin/user", mailBox);
app.use("/mailbox", mailBox);
app.use("/admin", pricingPlan);
app.use("/state", pricingPlan);
app.use("/admin", order);
app.use("/admin", company);
app.use("/admin", request);
app.use("/admin", document);
app.use(errorHandler);

if (Number(process.env.LIVE) == 1) {
  // live server
  var https = require("https");
  var fs = require("fs");
  var privateKey = fs.readFileSync(`/etc/letsencrypt/live/${process.env.DOMAIN}/privkey.pem`);
  var certificate = fs.readFileSync(`/etc/letsencrypt/live/${process.env.DOMAIN}/fullchain.pem`);

  https
    .createServer(
      {
        key: privateKey,
        cert: certificate,
      },
      app
    )
    .listen(process.env.PORT);
} else {
  //local server
  app.listen(process.env.PORT, () => console.log(`App is listening on port : ${process.env.PORT}`));
}
