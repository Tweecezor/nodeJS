const db = require("../models/koa-db");

module.exports.get = async (ctx, next) => {
  // if (req.session.isLoged) {
  //   res.redirect("/admin");
  // }
  await ctx.render("pages/login");
};

module.exports.post = async (ctx, next) => {
  if (!ctx.request.body.email || !ctx.request.body.password) {
    return await ctx.render("pages/login", {
      msgslogin: "Ошибка заполните поля"
    });
  }
  if (!validationLogin(ctx.request.body.email, ctx.request.body.password)) {
    return await ctx.render("pages/login", { msgslogin: "Неверные данные" });
  } else {
    // req.session.isLoged = true;
    ctx.session.isLoged = true;
    await ctx.redirect("/admin");
  }
};

function validationLogin(email, password) {
  if (
    email != db.get("user").value().email ||
    password != db.get("user").value().pass
  ) {
    console.log(" не совпадает");
    return false;
  } else {
    console.log("совпадает");
    return true;
  }
}
