module.exports.get = async (ctx, next) => {
  // if (req.session.isLoged) {
  //   res.redirect("/admin");
  // }
  await ctx.render("pages/login");
};

module.exports.post = async (ctx, next) => {
  console.log(ctx.request.body);
  if (!ctx.request.body.email || !ctx.request.body.password) {
    await ctx.render("pages/login", { msgslogin: "Ошибка заполните поля" });
  } else {
    // req.session.isLoged = true;
    ctx.cookies.set("isLoged", true);
    await ctx.redirect("/admin");
  }
};
