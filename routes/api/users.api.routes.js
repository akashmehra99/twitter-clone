const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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

router.post(
  "/profilePicture",
  upload.single("croppedImage"),
  async (req, res, next) => {
    if (!req.file) {
      console.log("no file uploaded with ajax");
      res.sendStatus(400);
    }
    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../../${filePath}`);
    fs.rename(tempPath, targetPath, async (error) => {
      if (error) {
        console.log(error);
        res.sendStatus(400);
      }
      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { profilePic: filePath },
        { new: true }
      );
      res.sendStatus(204);
    });
  }
);

router.post(
  "/coverPhoto",
  upload.single("croppedImage"),
  async (req, res, next) => {
    if (!req.file) {
      console.log("no file uploaded with ajax");
      res.sendStatus(400);
    }
    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../../${filePath}`);
    fs.rename(tempPath, targetPath, async (error) => {
      if (error) {
        console.log(error);
        res.sendStatus(400);
      }
      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { coverPhoto: filePath },
        { new: true }
      );
      res.sendStatus(204);
    });
  }
);

module.exports = router;
