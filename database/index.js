const ee = require("@nauma/eventemitter");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("./database/db.json");
const low = require("lowdb");
const db = low(adapter);
const DATABASE = new ee.EventEmitter("models");
global.DATABASE = DATABASE;

DATABASE.on("db/products", res => {
  const products = db.get("administrator").value().products;

  res.reply({ products });
});

DATABASE.on("db/skills", res => {
  const skills = db.get("administrator").value().skills;

  res.reply({ skills });
});

DATABASE.on("db/social", res => {
  const social = db.get("administrator").value().social;

  res.reply({ social });
});

DATABASE.on("db/msgemail", res => {
  db.get("administrator")
    .get("messages")
    .push(res.data)
    .write();

  res.reply({});
});

DATABASE.on("db/login/auth", res => {
  const { email, password } = db.get("administrator").value();
  res.reply({ email, password });
});

DATABASE.on("db/admin/skills", res => {
  const arr = Object.values(res.data);

  db.get("administrator")
    .get("skills")
    .value()
    .forEach((el, i) => (el.number = arr[i]));

  db.write();

  res.reply({});
});

DATABASE.on("db/admin/upload", res => {
  db.get("administrator")
    .get("products")
    .push(res.data)
    .write();

  res.reply({});
});
