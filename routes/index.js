const Router = require("koa-router");
const router = new Router();
const ENGINE = global.ENGINE;

const isAdmin = (ctx, next) => {
  if (ctx.session.isAdmin) {
    return next();
  }
  ctx.redirect("/");
};

router.get("/error", ctx => {
  const error = ctx.flash("error")[0];
  ctx.status = error.status;
  ctx.render("pages/error", error);
});

router.get("/", async ctx => {
  try {
    const data = await ENGINE.emit("index");
    const msgsemail = ctx.flash("msgsemail")[0];

    ctx.render("pages/index", {
      ...data,
      msgsemail
    });
  } catch (error) {
    ctx.flash("error", {
      message: error.message,
      status: error.status || 400
    });
    ctx.redirect("/error");
  }
});

router.post("/", async ctx => {
  try {
    const { msgsemail } = await ENGINE.emit("msgemail", ctx.request.body);
    ctx.flash("msgsemail", msgsemail);
    ctx.redirect("/");
  } catch (error) {
    ctx.flash("error", {
      message: error.message,
      status: error.status || 400
    });
    ctx.redirect("/error");
  }
});

router.get("/login", async ctx => {
  try {
    const social = await ENGINE.emit("social");
    const msglogin = ctx.flash("msglogin")[0];

    ctx.render("pages/login", {
      ...social,
      msglogin
    });
  } catch (error) {
    ctx.flash("error", {
      message: error.message,
      status: error.status || 400
    });
    ctx.redirect("/error");
  }
});

router.post("/login", async ctx => {
  const isAdmin = await ENGINE.emit("login/auth", ctx.request.body);
  try {
    if (isAdmin) {
      ctx.session.isAdmin = true;
      return ctx.redirect("/admin");
    }

    ctx.flash("msglogin", "Ошибка авторизации! Проверьте свой логин и пароль");
    ctx.redirect("/login");
  } catch (error) {
    ctx.flash("error", {
      message: error.message,
      status: error.status || 400
    });
    ctx.redirect("/error");
  }
});

router.get("/admin", isAdmin, ctx => {
  try {
    const msgskill = ctx.flash("msgskill")[0];
    const msgfile = ctx.flash("msgfile")[0];
    ctx.render("pages/admin", {
      msgskill,
      msgfile
    });
  } catch (error) {
    ctx.flash("error", {
      message: error.message,
      status: error.status || 400
    });
    ctx.redirect("/error");
  }
});

router.post("/admin/skills", async ctx => {
  try {
    const { msgskill } = await ENGINE.emit("admin/skills", ctx.request.body);
    ctx.flash("msgskill", msgskill);
    ctx.redirect("/admin");
  } catch (error) {
    ctx.flash("error", {
      message: error.message,
      status: error.status || 400
    });
    ctx.redirect("/error");
  }
});

router.post("/admin/upload", async ctx => {
  try {
    const { msgfile } = await ENGINE.emit("admin/upload", ctx.request);
    ctx.flash("msgfile", msgfile);
    ctx.redirect("/admin");
  } catch (error) {
    ctx.flash("error", {
      message: error.message,
      status: error.status || 400
    });
    ctx.redirect("/error");
  }
});

module.exports = router;
