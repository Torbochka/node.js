const express = require("express");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const createError = require("http-errors");

const app = express();

require("./models/index");
require("./engine/index");

app.set("views", "./views");
app.set("view engine", "pug");

app.use(
  session({
    secret: "auth",
    key: "sessionkey",
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 10 * 60 * 10000
    },
    saveUninitialized: false,
    resave: true,
    ephemeral: true,
    rolling: true
  })
);
app.use(cookieParser("keyboard cat"));
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));
app.use("/", require("./routes/index"));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("pages/error");
});

module.exports = app;
