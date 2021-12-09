const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
const router = express.Router();

const User = require("../schemas/UserSchema");

app.set("view engine", "pug");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
  var payload = {
    pageTitle: "Notifications",
  };
  res.status(200).render("notifications", payload);
});

module.exports = router;
