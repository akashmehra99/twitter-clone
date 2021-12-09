const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();

const User = require("../../schemas/UserSchema");
const Post = require("../../schemas/PostSchema");

app.use(bodyParser.urlencoded({ extended: false }));

const getPosts = async (filter) => {
  let posts = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({ createdAt: -1 })
    .catch((error) => {
      console.error(error);
    });
  posts = await User.populate(posts, {
    path: "replyTo.postedBy",
  });
  return await User.populate(posts, {
    path: "retweetData.postedBy",
  });
};

router.get("/", async (req, res, next) => {
  const posts = await getPosts({});
  res.status(200).send(posts);
});

router.get("/:postID", async (req, res, next) => {
  const postId = req.params.postID;
  let post = await getPosts({ _id: postId });
  post = post[0];
  let postData = {
    post: post,
  };
  if (post.replyTo) {
    postData.replyTo = post.replyTo;
    postData.replies = await getPosts({ replyTo: postId });
  }
  res.status(200).send(postData);
});

router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    console.log("Content attibute missing");
    return res.sendStatus(400);
  }
  let postData = {
    content: req.body.content,
    postedBy: req.session.user,
  };
  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
  }
  Post.create(postData)
    .then(async (newPost) => {
      newPost = await User.populate(newPost, { path: "postedBy" });
      res.status(201).send(newPost);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

router.put("/:postID/like", async (req, res, next) => {
  const postID = req.params.postID;
  const userID = req.session.user._id;
  const isLiked =
    req.session.user.likes && req.session.user.likes.includes(postID);
  const option = isLiked ? "$pull" : "$addToSet";

  // Insert user like
  req.session.user = await User.findByIdAndUpdate(
    userID,
    {
      [option]: { likes: postID },
    },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  // Insert post like
  const post = await Post.findByIdAndUpdate(
    postID,
    {
      [option]: { likes: userID },
    },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });
  res.status(200).send(post);
});

router.post("/:postID/retweet", async (req, res, next) => {
  const postID = req.params.postID;
  const userID = req.session.user._id;

  // Try and delete retweet
  const deletedPost = await Post.findOneAndDelete({
    postedBy: userID,
    retweetData: postID,
  }).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });
  const option = deletedPost ? "$pull" : "$addToSet";

  let repost = deletedPost;
  if (!repost) {
    repost = await Post.create({ postedBy: userID, retweetData: postID }).catch(
      (error) => {
        console.log(error);
        res.sendStatus(400);
      }
    );
  }

  // Insert user retweets
  req.session.user = await User.findByIdAndUpdate(
    userID,
    {
      [option]: { retweets: repost._id },
    },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  // Insert post retweet users
  const post = await Post.findByIdAndUpdate(
    postID,
    {
      [option]: { retweetUsers: userID },
    },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });
  res.status(200).send(post);
});

router.delete("/:postID", (req, res, next) => {
  Post.findByIdAndDelete(req.params.postID)
    .then(() => res.sendStatus(202))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

module.exports = router;
