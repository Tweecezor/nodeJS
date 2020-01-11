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

// module.exports.get = function(req, res) {
//   res.render("pages/admin", {
//     title: "About",
//     msgfile: req.query.msg,
//     skill: db.stores.file.store.skills
//   });
// };
module.exports.get = async (ctx, next) => {
  // console.log(ctx.cookies.get("isLoged"));
  // console.log(db);
  // db.get("skills")
  //   .push({ age: 22, text: "text" })
  //   .write();
  // await db.defaults({ products: [], skills: [] });
  // console.log(db.get("skills").value());
  // db.get("skills")
  //   .push({ id: 2 })
  //   .write();
  // console.log(db.get("skills").value());

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
  await ctx.redirect("/admin?msgs=Данные успешно обновлены");
};

module.exports.upload = async (ctx, next) => {
  console.log("Внутри upload");
  // console.log(ctx.request.body);
  var { name, price } = ctx.request.body;

  let upload = path.join("./public", "uploads");
  const fileName = path.join(upload, ctx.request.files.photo.name);
  console.log(fileName);
  rename(ctx.request.files.photo.path, fileName, async function(err) {
    if (err) {
      console.error(err.message);
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
  });
  // });
};

// const validationProducts = (fields, files) => {
//   // console.log(fields);
//   // console.log(files);
//   if (files.photo.name === "" || files.photo.size === 0) {
//     return { status: "Не загружена картинка!", err: true };
//   }
//   if (!fields.name) {
//     return { status: "Не указано описание картинки!", err: true };
//   }
//   return { status: "Ok", err: false };
// };

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
