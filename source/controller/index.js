const mailer = require("../routes/nodemailer");

// const dbSkills = require("../models/skills-db")();
const db = require("../models/products-db")();

function getProductsFromDB() {
  var productsDB = {};
  var myDB = db.stores.file.store;
  for (let key in myDB) {
    if (key != "skills") {
      productsDB[`${key}`] = myDB[key];
    }
  }
  return productsDB;
}

module.exports.get = function(req, res) {
  res.render("pages/index", {
    pic: getProductsFromDB(),
    skill: db.stores.file.store.skills
  });
};
module.exports.post = function(req, res) {
  if (!req.body.name || !req.body.email || !req.body.message) {
    // если что-либо не указано - сообщаем об этом
    // return res.json({ msg: "Все поля нужно заполнить!", status: "Error" });
    return res.render("pages/index", { msgemail: "Все поля нужно заполнить" });
  }
  console.log("После проверки!!");
  const message = {
    from: `"${req.body.name}" <${req.body.email}>`,
    to: "loftnodejstest@gmail.com",
    subject: "Сообщение с моего сайта",
    html: `
      Сообщение было отправлено с пользователем <i>${req.body.name}</i> с почтой <bold>${req.body.email}</bold>
      <p>Текст сообщения: ${req.body.message}</p>
    `
  };
  mailer(message);
  res.render("pages/index", {
    msgemail: "Сообщение успешно отправлено",
    pic: getProductsFromDB(),
    skill: db.stores.file.store.skills
  });
};
