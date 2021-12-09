const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

// Data base

const dataBase = require("./database");

// Middle Ware
const middleware = require("./middleware");

// Routes
const loginRoute = require("./routes/login.routes");
const registerRoute = require("./routes/register.routes");
const logoutRoute = require("./routes/logout.routes");
const searchRoute = require("./routes/search.routes");
const profileRoute = require("./routes/profile.routes");
const notificationsRoute = require("./routes/notifications.routes");
const messagesRoute = require("./routes/messages.routes");
const postPageRoute = require("./routes/post.routes");

// API routes

const postAPIRoutes = require("./routes/api/posts.api.routes");

// Session
const session = require("express-session");

const app = express();
const PORT = 3000;

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "teen patti",
    resave: true,
    saveUninitialized: false,
  })
);

const server = app.listen(PORT, () => console.log("Listening to port ", PORT));

app.get("/", middleware.requireLogin, (req, res, next) => {
  var payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJS: JSON.stringify(req.session.user),
  };
  res.status(200).render("home", payload);
});

// Pages
app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/search", middleware.requireLogin, searchRoute);
app.use("/profile", middleware.requireLogin, profileRoute);
app.use("/notifications", middleware.requireLogin, notificationsRoute);
app.use("/messages", middleware.requireLogin, messagesRoute);
app.use("/post", middleware.requireLogin, postPageRoute);

// API's
app.use("/api/posts", postAPIRoutes);
