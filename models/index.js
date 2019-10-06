const ee = require("@nauma/eventemitter");
const DATABASE = new ee.EventEmitter("models");
global.DATABASE = DATABASE;

const db = {
  administrator: {
    email: "test@test.ru",
    password: "qwerty",
    messages: [],
    skills: [
      {
        number: 7,
        text: "Возраст начала занятий на скрипке"
      },
      {
        number: 76,
        text: "Концертов отыграл"
      },
      {
        number: 30,
        text: "Максимальное число городов в туре"
      },
      {
        number: 20,
        text: "Лет на сцене в качестве скрипача"
      }
    ],
    products: [
      {
        src: "./assets/img/products/Work1.jpg",
        name: "Вино вдохновение",
        price: 600
      },
      {
        src: "./assets/img/products/Work2.jpg",
        name: "Вино вдохновение",
        price: 600
      },
      {
        src: "./assets/img/products/Work3.jpg",
        name: "Вино вдохновение",
        price: 600
      },
      {
        src: "./assets/img/products/Work4.jpg",
        name: "Вино вдохновение",
        price: 600
      },
      {
        src: "./assets/img/products/Work5.jpg",
        name: "Вино вдохновение",
        price: 600
      },
      {
        src: "./assets/img/products/Work6.jpg",
        name: "Вино вдохновение",
        price: 600
      },
      {
        src: "./assets/img/products/Work7.jpg",
        name: "Вино вдохновение",
        price: 600
      },
      {
        src: "./assets/img/products/Work8.jpg",
        name: "Вино вдохновение",
        price: 600
      },
      {
        src: "./assets/img/products/Work9.jpg",
        name: "Вино вдохновение",
        price: 600
      }
    ]
  }
};

DATABASE.on("db/index", res => {
  const {
    administrator: { products, skills }
  } = db;

  res.reply({ products, skills });
});

DATABASE.on("db/email", res => {
  const {
    administrator: { products, skills }
  } = db;

  db.administrator.messages.push(res.data);
  res.reply({ products, skills });
});

DATABASE.on("db/login/auth", res => {
  const {
    administrator: { email, password }
  } = db;

  res.reply({ email, password });
});

DATABASE.on("db/admin/skills", res => {
  const arr = Object.values(res.data);
  db.administrator.skills.forEach((el, i) => (el.number = arr[i]));

  res.reply({});
});

DATABASE.on("db/admin/upload", res => {
  db.administrator.products.push(res.data);

  res.reply({});
});
