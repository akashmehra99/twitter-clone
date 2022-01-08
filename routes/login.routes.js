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
    pageTitle: "Login",
  };
  res.status(200).render("login", payload);
});

router.post("/", async (req, res, next) => {
  var payload = {
    pageTitle: "Login",
  };
  if (req.body.logUserName && req.body.logPassword) {
    const user = await User.findOne({
      $or: [
        {
          username: req.body.logUserName,
        },
        { email: req.body.logUserName },
      ],
    }).catch((error) => {
      console.log("Something went wrong -> ", error);
      payload.errorMessage = "Something went wrong!";
      res.status(200).render("login", payload);
    });
    if (user) {
      const result = await bcrypt.compare(req.body.logPassword, user.password);
      if (result) {
        req.session.user = user;
        return res.redirect("/");
      } else {
        payload.errorMessage = "Enter Valid password!";
        return res.status(200).render("login", payload);
      }
    } else {
      payload.errorMessage = "No account with this username exists!";
      return res.status(200).render("login", payload);
    }
  } else {
    if (!req.body.logUserName) {
      payload.errorMessage = "Please enter User name!";
    } else if (req.body.logPassword) {
      payload.errorMessage = "Please enter password!";
    } else {
      payload.errorMessage = "Please enter user name & password!";
    }
    return res.status(200).render("login", payload);
  }
});

module.exports = router;
