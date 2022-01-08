const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();

const User = require("../../schemas/UserSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.put("/:userID/follow", async (req, res, next) => {
  const userID = req.params.userID;
  const user = await User.findById(userID);
  if (user) {
    const isFollowing =
      user.followers && user.followers.includes(req.session.user._id);
    const option = isFollowing ? "$pull" : "$addToSet";
    req.session.user = await User.findByIdAndUpdate(
      req.session.user._id,
      {
        [option]: { following: userID },
      },
      { new: true }
    ).catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });

    User.findByIdAndUpdate(userID, {
      [option]: { followers: req.session.user._id },
    }).catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
    res.status(200).send(req.session.user);
  } else {
    res.sendStatus(404);
  }
});

router.get("/:userID/following", async (req, res, next) => {
  User.findById(req.params.userID)
    .populate("following")
    .then((user) => res.status(200).send(user))
    .catch((error) => {
      console.log("error -> ", error);
      res.sendStatus(400);
    });
});

router.get("/:userID/followers", async (req, res, next) => {
  User.findById(req.params.userID)
    .populate("followers")
    .then((user) => res.status(200).send(user))
    .catch((error) => {
      console.log("error -> ", error);
      res.sendStatus(400);
    });
});

module.exports = router;
