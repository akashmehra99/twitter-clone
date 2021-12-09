const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();

app.set("view engine", "pug");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));

router.get("/:postID", (req, res, next) => {
  var payload = {
    pageTitle: "View Post",
    userLoggedIn: req.session.user,
    userLoggedInJS: JSON.stringify(req.session.user),
    postID: req.params.postID,
  };
  res.status(200).render("postPage", payload);
});

module.exports = router;
