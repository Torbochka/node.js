const fs = require("fs");
const ee = require("@nauma/eventemitter");
const joi = require("joi");
const formidable = require("formidable");
const path = require("path");
const utils = require("./utils");
const ENGINE = new ee.EventEmitter("engine");
global.ENGINE = ENGINE;

ENGINE.on("index", res => {
  DATABASE.emit("db/index")
    .then(({ products, skills }) => res.reply({ products, skills }))
    .catch(_ => res.replyErr({ message: err.message, stack: err.stack }));
});

ENGINE.on("email", res => {
  const schema = joi.object().keys({
    name: joi.string().alphanum(),
    email: joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ru", "ua"] }
    }),
    message: joi.string().allow("")
  });

  joi.validate(res.data, schema, (err, { name, email, message }) => {
    if (err) {
      DATABASE.emit("db/index")
        .then(({ products, skills }) =>
          res.reply({ products, skills, msgsemail: err.message })
        )
        .catch(_ => res.replyErr({ message: err.message, stack: err.stack }));
    }
  });

  DATABASE.emit("db/email", res.data)
    .then(({ products, skills }) => {
      res.reply({
        products,
        skills,
        msgsemail: "Сообщение отправлено на автору"
      });
    })
    .catch(_ => res.replyErr({ message: _.message, stack: _.stack }));
});

ENGINE.on("login/auth", res => {
  const { email: e, password: p } = res.data;

  DATABASE.emit("db/login/auth")
    .then(({ email, password }) => res.reply(e === email && p === password))
    .catch(_ => res.replyErr({ message: _.message, stack: _.stack }));
});

ENGINE.on("admin/skills", res => {
  const schema = joi.object().keys({
    age: joi
      .number()
      .positive()
      .allow(0),
    concerts: joi
      .number()
      .positive()
      .allow(0),
    cities: joi
      .number()
      .positive()
      .allow(0),
    years: joi
      .number()
      .positive()
      .allow(0)
  });

  joi.validate(res.data, schema, (err, { age, concerts, cities, years }) => {
    if (err) {
      return res.reply({
        msgskill: err.message
      });
    }
  });

  DATABASE.emit("db/admin/skills", res.data)
    .then(() => res.reply({ msgskill: "Данные изменены" }))
    .catch(_ => res.replyErr({ message: _.message, stack: _.stack }));
});

ENGINE.on("admin/upload", async res => {
  let form = new formidable.IncomingForm();
  let upload = path.join("./public", "upload");

  await utils.existDirORcreate(upload);

  form.uploadDir = path.join(process.cwd(), upload);
  form.parse(res.data, async (err, fields, files) => {
    if (err) {
      return res.replyErr(err);
    }

    const val = utils.validationForm(fields, files);

    if (val.err) {
      await unlink(files.photo.path);
      return res.reply({ msgfile: val.status });
    }

    const fileName = path.join(upload, files.photo.name);

    fs.rename(files.photo.path, fileName, err => {
      if (err) {
        return res.replyErr({ message: err.message, stack: err.stack });
      }

      const pathFileName = fileName.substr(fileName.indexOf("/"));

      DATABASE.emit("db/admin/upload", {
        src: pathFileName,
        name: fields.name,
        price: fields.price
      })
        .then(() => res.reply({ msgfile: "Товар добавлен" }))
        .catch(_ => res.replyErr({ message: _.message, stack: _.stack }));
    });
  });
});
