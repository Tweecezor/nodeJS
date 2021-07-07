const db = require("../models/products-db")();

module.exports.get = function(req, res) {
  if (req.session.isLoged) {
    res.redirect("/admin");
  }
  res.render("pages/login", {
    msgslogin: req.flash("msgslogin")[0]
  });
};

module.exports.post = function(req, res) {
  //   console.log("password: " + req.body.password);
  //   console.log(!req.body.password);
  //   console.log(!req.body.email);
  if (!req.body.email || !req.body.password) {
    req.flash("msgslogin", "Ошибка заполните поля");
    return res.redirect("/login");
  }
  if (!validationLogin(req.body.email, req.body.password)) {
    req.flash("msgslogin", "Неверные данные");
    return res.redirect("/login");
  } else {
    req.session.isLoged = true;

    res.redirect("/admin");
  }
};
function validationLogin(email, password) {
  console.log(db.stores.file.store.user.email);
  if (
    email != db.stores.file.store.user.email ||
    password != db.stores.file.store.user.pass
  ) {
    console.log(" не совпадает");
    return false;
  } else {
    console.log("совпадает");
    return true;
  }
}
