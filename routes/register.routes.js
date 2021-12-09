const express = require("express");
const bcrypt = require("bcrypt");

const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../schemas/UserSchema");

app.set("view engine", "pug");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
  var payload = {
    pageTitle: "Register",
  };
  res.status(200).render("register", payload);
});

router.post("/", async (req, res, next) => {
  var payload = req.body;
  payload.pageTitle = "Register";
  var firstName = req.body.firstName && req.body.firstName.trim();
  var lastName = req.body.lastName && req.body.lastName.trim();
  var username = req.body.username && req.body.username.trim();
  var email = req.body.email && req.body.email.trim();
  var password = req.body.password;
  if (firstName && lastName && username && email && password) {
    const user = await User.findOne({
      $or: [
        {
          username: username,
        },
        {
          email: email,
        },
      ],
    }).catch((error) => {
      console.log("Error in checking unique user -> ", error);
      payload.errorMessage = "Something went wrong!";
      res.status(200).render("register", payload);
    });
    if (!user) {
      console.log("unique user");
      let userData = req.body;
      userData.password = await bcrypt.hash(password, 10);
      User.create(userData)
        .then((user) => {
          console.log("DB updated with ->", user);
          req.session.user = user;
          res.redirect("/");
        })
        .catch((error) => {
          console.log("Something went wrong", error);
          payload.errorMessage = "Something went wrong!";
          res.status(200).render("register", payload);
        });
    } else {
      if (email === user.email) {
        payload.errorMessage = "User with email already exists!";
      } else if (username === user.username) {
        payload.errorMessage = "User with username already exists!";
      }
      res.status(200).render("register", payload);
    }
  } else {
    payload.errorMessage = "Make Sure that each field has a valid value!";
    res.status(200).render("register", payload);
  }
});

module.exports = router;
