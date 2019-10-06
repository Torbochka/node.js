const fs = require("fs");
const util = require("util");
const stat = util.promisify(fs.stat);
const unlink = util.promisify(fs.unlink);
const mkdir = util.promisify(fs.mkdir);
const nodemailer = require("nodemailer");
const config = require("../config");

module.exports.existDirORcreate = async dest => {
  try {
    return await stat(dest);
  } catch (e) {
    if (e.code === "ENOENT") {
      return await mkdir(dest);
    } else {
      throw e;
    }
  }
};

module.exports.validationForm = (fields, files) => {
  if (files.photo.name === "" || files.photo.size === 0) {
    return { status: "Изображение товара не загружено", err: true };
  }

  if (!fields.name) {
    return { status: "Не указано название товара", err: true };
  }

  if (!fields.price) {
    return { status: "Не указана цена товара", err: true };
  }

  return { status: "Товар добавлен", err: false };
};
