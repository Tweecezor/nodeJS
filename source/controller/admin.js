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
  console.log(ctx.params.skill);
  await ctx.render("pages/admin");
};

module.exports.skills = async (ctx, next) => {
  console.log("внутри skills");
  const valid = validationSkills(ctx.request.body);
  if (valid.err) {
    return await ctx.redirect(`/admin?msg=${valid.status}`);
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
  // ctx.request.flash("msgskill", "Данные успешно обновлены");
  this.flash("msgskill", "Данные успешно обновлены");
  await ctx.redirect("/admin");
};

module.exports.upload = async (ctx, next) => {
  console.log("Внутри upload");
  // console.log(ctx.request.body);
  var { name, price } = ctx.request.body;

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
  await ctx.redirect("/admin?msg=Картинка успешно загружена");
};

const validationSkills = fields => {
  if (!fields.age) {
    return { status: "Не указан возраст", err: true };
  }
  if (!fields.concerts) {
    return { status: "Не указано кол-во концертов", err: true };
  }
  if (!fields.cities) {
    return { status: "Не указано кол-во городов", err: true };
  }
  if (!fields.years) {
    return { status: "Не указано кол-во лет на сцене", err: true };
  }
  return { status: "Ok", err: false };
};
