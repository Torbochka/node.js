const Koa = require("koa");
const app = new Koa();
const fs = require("fs");
const static = require("koa-static");
const session = require("koa-session");
const body = require("koa-body");
const flash = require("koa-connect-flash");
const Pug = require("koa-pug");
const utils = require("./libs/utils");

require("./database/index");
require("./engine/index");

const pug = new Pug({
  viewPath: "./views",
  pretty: false,
  basedir: "./views",
  noCache: true,
  app: app
});
const errorHandler = require("./libs/error");
const config = require("./config");
const router = require("./routes");
const port = process.env.PORT || 5000;

app.use(static("./public"));
app.use(errorHandler);

app.use(
  body({
    multipart: true,
    formidable: {
      uploadDir: config.upload,
      keepExtensions: true
    }
  })
);

app.on("error", (err, ctx) => {
  ctx.request;
  ctx.response.body = {};
  ctx.render("pages/error", {
    status: ctx.response.status,
    error: ctx.response.message
  });
});

app
  .use(session(config.session, app))
  .use(flash())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port, () => {
  utils.existDirORcreate(config.upload);
  console.log(`Server running on http://localhost:${port}`);
});
