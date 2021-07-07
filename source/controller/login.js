const db = require("../models/koa-db");

module.exports.get = async (ctx, next) => {
  // if (req.session.isLoged) {
  //   res.redirect("/admin");
  // }
  await ctx.render("pages/login", {
    msgslogin: ctx.flash("msgslogin")[0]
  });
};

module.exports.post = async (ctx, next) => {
  if (!ctx.request.body.email || !ctx.request.body.password) {
    ctx.flash("msgslogin", "Ошибка заполните поля");
    return await ctx.redirect("/login");
  }
  if (!validationLogin(ctx.request.body.email, ctx.request.body.password)) {
    ctx.flash("msgslogin", "Неверные данные");
    return await ctx.redirect("/login");
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
