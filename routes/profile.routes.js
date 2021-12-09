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
  let payload = {
    pageTitle: req.session.user.username,
    userLoggedIn: req.session.user,
    userLoggedInJS: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };
  res.status(200).render("profile", payload);
});

router.get("/:username", async (req, res, next) => {
  let payload = {
    userLoggedIn: req.session.user,
    userLoggedInJS: JSON.stringify(req.session.user),
    ...(await getPayload(req.params.username)),
  };
  res.status(200).render("profile", payload);
});

const getPayload = async (username) => {
  let user;
  try {
    user =
      (await User.findOne({ username: username })) ||
      (await User.findById(username));
    if (user) {
      return {
        pageTitle: user.username,
        profileUser: user,
      };
    } else {
      return {
        pageTitle: "User not found.",
      };
    }
  } catch (error) {
    return {
      pageTitle: "User not found.",
    };
  }
};

module.exports = router;
