const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const db = require("../models/koa-db");
const os = require("os");
const util = require("util");
const rename = util.promisify(fs.rename);
// const skillsDB = db.stores.file.store.skills;
// const dbSkills = require("../models/skills-db")();
const platform = process.platform;

module.exports.get = async (ctx, next) => {
  // var status = ctx.flash("msgskillstatus")[0];
  // console.log(status.two || false);
  await ctx.render("pages/admin", {
    msgSkillStatus: ctx.flash("msgskillstatus")[0],
    msgfile: ctx.flash("msgfile")[0]
  });
};

module.exports.skills = async (ctx, next) => {
  console.log("внутри skills");
  const valid = validationSkills(ctx.request.body);
  if (valid.err) {
    ctx.flash("msgskillstatus", `${valid.status}`);
    return await ctx.redirect(`/admin`);
  }
  db.set("skills.age", {
    number: ctx.request.body.age,
    text: "Возраст начала занятий на скрипке"
  }).write();
  db.set("skills.concerts", {
    number: ctx.request.body.concerts,
    text: "Концертов отыграл"
  }).write();
  db.set("skills.cities", {
    number: ctx.request.body.cities,
    text: "Максимальное число городов в туре"
  }).write();
  db.set("skills.years", {
    number: ctx.request.body.years,
    text: "Лет на сцене в качестве скрипача"
  }).write();
  // ctx.flash("msgskill", "text");
  ctx.flash("msgskillstatus", "Данные успешно обновлены");
  // ctx.flash.set(" ctx.flash("msgskill", true, "text");");
  // this.flash("msgskill", "Данные успешно обновлены");
  await ctx.redirect("/admin");
};

module.exports.upload = async (ctx, next) => {
  var { name, price } = ctx.request.body;
  const valid = validationProducts(ctx.request.body, ctx.request.body);
  if (valid.err) {
    ctx.flash("msgfile", `${valid.status}`);
    return await ctx.redirect(`/admin`);
  }
  let upload = path.join("./public", "uploads");
  const fileName = path.join(upload, ctx.request.files.photo.name);
  console.log(fileName);
  const errorRename = await rename(ctx.request.files.photo.path, fileName);
  if (errorRename) {
    console.error("Ошибка при загрузке");
    return;
  }
  console.log(fileName);
  let dir;
  switch (platform) {
    case "darwin":
      dir = fileName.substr(fileName.indexOf("/"));
      break;
    case "win32":
      dir = fileName.substr(fileName.indexOf("\\"));
      break;
    default:
      dir = fileName.substr(fileName.indexOf("/"));
  }
  db.get("products")
    .push({
      path: dir,
      name,
      price
    })
    .write();
  ctx.flash("msgfile", "Товар добавлен");
  await ctx.redirect("/admin");
};

const validationSkills = fields => {
  let error = false;
  if (!fields.age) {
    error = true;
  }
  if (!fields.concerts) {
    error = true;
  }
  if (!fields.cities) {
    error = true;
  }
  if (!fields.years) {
    error = true;
  }
  if (error) {
    return { status: "ЗАполните все поля", err: true };
  } else return { status: "Ok", err: false };
};
const validationProducts = (file, fields) => {
  // console.log(fields);
  // console.log(files);
  if (file.name === "" || file.size === 0) {
    return { status: "Не загружена картинка!", err: true };
  }
  if (!fields.name) {
    return { status: "Не указано описание товара!", err: true };
  }
  if (!fields.price) {
    return { status: "Не указана цена товара!", err: true };
  }
  return { status: "Ok", err: false };
};
