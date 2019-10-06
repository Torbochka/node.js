const express = require("express");
const router = express.Router();
const ENGINE = global.ENGINE;

const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    return next();
  }
  res.redirect("/");
};

router.get("/error", (req, res) => {
  const error = req.flash("error");
  res.status(error.status).render("pages/error", ...error);
});

router.get("/", async (req, res) => {
  try {
    const data = await ENGINE.emit("index");
    const msgsemail = req.flash("msgsemail")[0];

    res.render("pages/index", {
      ...data,
      msgsemail
    });
  } catch (error) {
    req.flash("error", { message: error.message, status: error.status || 400 });
    res.redirect("/error");
  }
});

router.post("/", async (req, res) => {
  try {
    const { msgsemail } = await ENGINE.emit("msgemail", req.body);
    req.flash("msgsemail", msgsemail);
    res.redirect("/");
  } catch (error) {
    req.flash("error", { message: error.message, status: error.status || 400 });
    res.redirect("/error");
  }
});

router.get("/login", async (req, res) => {
  try {
    const social = await ENGINE.emit("social");
    const msglogin = req.flash("msglogin")[0];

    res.render("pages/login", {
      ...social,
      msglogin
    });
  } catch (error) {
    req.flash("error", { message: error.message, status: error.status || 400 });
    res.redirect("/error");
  }
});

router.post("/login", async (req, res) => {
  const isAdmin = await ENGINE.emit("login/auth", req.body);
  try {
    if (isAdmin) {
      req.session.isAdmin = true;
      return res.redirect("/admin");
    }

    req.flash("msglogin", "Ошибка авторизации! Проверьте свой логин и пароль");
    res.redirect("/login");
  } catch (error) {
    req.flash("error", { message: error.message, status: error.status || 400 });
    res.redirect("/error");
  }
});

router.get("/admin", isAdmin, (req, res) => {
  try {
    const msgskill = req.flash("msgskill")[0];
    const msgfile = req.flash("msgfile")[0];
    res.render("pages/admin", {
      msgskill,
      msgfile
    });
  } catch (error) {
    req.flash("error", { message: error.message, status: error.status || 400 });
    res.redirect("/error");
  }
});

router.post("/admin/skills", async (req, res) => {
  try {
    const { msgskill } = await ENGINE.emit("admin/skills", req.body);
    req.flash("msgskill", msgskill);
    res.redirect("/admin");
  } catch (error) {
    req.flash("error", { message: error.message, status: error.status || 400 });
    res.redirect("/error");
  }
});

router.post("/admin/upload", async (req, res) => {
  try {
    const { msgfile } = await ENGINE.emit("admin/upload", req);
    req.flash("msgfile", msgfile);
    res.redirect("/admin");
  } catch (error) {
    req.flash("error", { message: error.message, status: error.status || 400 });
    res.redirect("/error");
  }
});

module.exports = router;
