const mailer = require("../routes/nodemailer");
const db = require("../models/koa-db");

module.exports.get = async (ctx, next) => {
  await ctx.render("pages/index", {
    skill: db.get("skills").value(),
    pic: db.get("products").value(),
    msgemail: ctx.flash("msgemail")[0]
  });
};
module.exports.post = async (ctx, next) => {
  if (
    !ctx.request.body.name ||
    !ctx.request.body.email ||
    !ctx.request.body.message
  ) {
    // если что-либо не указано - сообщаем об этом
    // return res.json({ msg: "Все поля нужно заполнить!", status: "Error" });
    ctx.flash("msgemail", "Все поля нужно заполнить");
    return await ctx.redirect(`/`);
  }
  console.log("После проверки!!");
  const message = {
    from: `"${ctx.request.body.name}" <${ctx.request.body.email}>`,
    to: "loftnodejstest@gmail.com",
    subject: "Сообщение с моего сайта",
    html: `
      Сообщение было отправлено с пользователем <i>${ctx.request.body.name}</i> с почтой <bold>${ctx.request.body.email}</bold>
      <p>Текст сообщения: ${ctx.request.body.message}</p>
    `
  };
  mailer(message);
  ctx.flash("msgemail", "Сообщение успешно отправлено");
  return await ctx.redirect(`/`);
};
