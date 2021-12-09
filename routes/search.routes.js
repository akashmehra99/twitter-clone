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
    pageTitle: "Search",
  };
  res.status(200).render("search", payload);
});

module.exports = router;
