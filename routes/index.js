const express = require("express");
const router = express.Router();
const ENGINE = global.ENGINE;

const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    return next();
  }
  res.redirect("/");
};

router.get("/", (req, res) => {
  ENGINE.emit("index").then(({ products, skills }) =>
    res.render("pages/index", { products, skills })
  );
});

router.post("/", (req, res) => {
  ENGINE.emit("email", req.body)
    .then(({ products, skills, msgsemail }) => {
      req.flash("msgsemail", msgsemail);
      res.render("pages/index", {
        products,
        skills,
        msgsemail: req.flash("msgsemail")
      });
    })
    .catch(error =>
      res
        .status(error.status || 400)
        .render("pages/error", { message: error.message, status: error.status })
    );
});

router.get("/login", (req, res) => {
  res.render("pages/login");
});

router.post("/login", (req, res) => {
  ENGINE.emit("login/auth", req.body)
    .then(isAdmin => {
      if (isAdmin) {
        req.session.isAdmin = true;
        return res.redirect("/admin");
      }

      req.flash("msg", "Ошибка авторизации! Проверьте свой логин и пароль");

      res.render("pages/login", {
        msglogin: req.flash("msg")
      });
    })
    .catch(error =>
      res
        .status(error.status || 400)
        .render("pages/error", { message: error.message, status: error.status })
    );
});

router.get("/admin", isAdmin, (req, res) => {
  res.render("pages/admin");
});

router.post("/admin/skills", (req, res) => {
  ENGINE.emit("admin/skills", req.body)
    .then(({ msgskill }) => {
      req.flash("msgskill", msgskill);
      res.render("pages/admin", { msgskill: req.flash("msgskill") });
    })
    .catch(error =>
      res
        .status(error.status || 400)
        .render("pages/error", { message: error.message, status: error.status })
    );
});

router.post("/admin/upload", (req, res) => {
  ENGINE.emit("admin/upload", req)
    .then(({ msgfile }) => {
      req.flash("msgfile", msgfile);
      res.render("pages/admin", { msgfile: req.flash("msgfile") });
    })
    .catch(error =>
      res
        .status(error.status || 400)
        .render("pages/error", { message: error.message, status: error.status })
    );
});

module.exports = router;
