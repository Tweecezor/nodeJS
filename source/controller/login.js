module.exports.get = function(req, res) {
  if (req.session.isLoged) {
    res.redirect("/admin");
  }
  res.render("pages/login");
};

module.exports.post = function(req, res) {
  //   console.log("password: " + req.body.password);
  //   console.log(!req.body.password);
  //   console.log(!req.body.email);
  if (!req.body.email || !req.body.password) {
    res.render("pages/login", { msgslogin: "Ошибка заполните поля" });
  } else {
    req.session.isLoged = true;
    res.redirect("/admin");
  }
};
