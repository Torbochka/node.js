const fs = require("fs");
const util = require("util");
const unlink = util.promisify(fs.unlink);
const ee = require("@nauma/eventemitter");
const joi = require("joi");
const path = require("path");
const utils = require("../libs/utils");
const config = require("../config/index");
const ENGINE = new ee.EventEmitter("engine");
global.ENGINE = ENGINE;

ENGINE.on("index", async res => {
  try {
    const { products } = await DATABASE.emit("db/products");
    const { skills } = await DATABASE.emit("db/skills");
    const { social } = await DATABASE.emit("db/social");
    res.reply({ products, skills, social });
  } catch (err) {
    res.replyErr({ message: err.message });
  }
});

ENGINE.on("social", async res => {
  try {
    const { social } = await DATABASE.emit("db/social");
    res.reply({ social });
  } catch (err) {
    res.replyErr({ message: err.message });
  }
});

ENGINE.on("msgemail", res => {
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
      return res.reply({ msgsemail: err.message });
    }

    DATABASE.emit("db/msgemail", res.data)
      .then(() => {
        res.reply({
          msgsemail: "Сообщение отправлено автору"
        });
      })
      .catch(err => res.replyErr({ message: err.message }));
  });
});

ENGINE.on("login/auth", async res => {
  try {
    const { email: e, password: p } = res.data;
    const { email, password } = await DATABASE.emit("db/login/auth");
    res.reply(e === email && p === password);
  } catch (err) {
    res.replyErr({ message: err.message });
  }
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

    DATABASE.emit("db/admin/skills", res.data)
      .then(() => res.reply({ msgskill: "Данные изменены" }))
      .catch(err => res.replyErr({ message: err.message }));
  });
});

ENGINE.on("admin/upload", async res => {
  try {
    const { files, body } = res.data;
    const val = utils.validationForm(body, files);

    if (val.err) {
      await unlink(files.photo.path);
      return res.reply({ msgfile: val.status });
    }

    const fileName = path.join(config.upload, files.photo.name);

    fs.rename(files.photo.path, fileName, err => {
      if (err) {
        return res.replyErr({ message: err.message });
      }

      const pathFileName = fileName.substr(fileName.indexOf("/"));

      DATABASE.emit("db/admin/upload", {
        src: pathFileName,
        name: body.name,
        price: body.price
      })
        .then(() => res.reply({ msgfile: "Товар добавлен" }))
        .catch(err => res.replyErr({ message: err.message }));
    });
  } catch (err) {
    res.replyErr({ message: err.message });
  }
});
