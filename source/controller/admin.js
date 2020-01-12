const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const db = require("../models/products-db")();
// const skillsDB = db.stores.file.store.skills;
// const dbSkills = require("../models/skills-db")();
const platform = process.platform;

module.exports.get = function(req, res) {
  res.render("pages/admin", {
    title: "About",
    msgfile: req.query.msg,
    msgskill: req.query.skill,
    skill: db.stores.file.store.skills
  });
};

module.exports.skills = function(req, res, next) {
  // console.log("внутри skills");
  // console.log(skillsDB);
  let form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) {
      console.log(err);
      next(err);
    }
    const valid = validationSkills(fields, files);
    if (valid.err) {
      return res.redirect(`/?msg=${valid.status}`);
    }
    // console.log(fields);

    var skills = {
      age: {
        number: fields.age,
        text: "Возраст начала занятий на скрипке"
      },
      concerts: {
        number: fields.concerts,
        text: "Концертов отыграл"
      },
      cities: {
        number: fields.cities,
        text: "Максимальное число городов в туре"
      },
      years: {
        number: fields.years,
        text: "Лет на сцене в качестве скрипача"
      }
    };
    db.set("skills", skills);
    // db.set("concerts", {
    //   number: fields.concerts,
    //   text: "Концертов отыграл"
    // });
    // db.set("cities", {
    //   number: fields.cities,
    //   text: "Максимальное число городов в туре"
    // });
    // db.set("years", {
    //   number: fields.cities,
    //   text: "Лет на сцене в качестве скрипача"
    // });
    db.save();
    res.redirect("/admin?skill=Данные успешно обновлены");
  });
};

module.exports.upload = function(req, res, next) {
  console.log("Внутри upload");
  // console.log(dbProducts.stores.file.store);
  let form = new formidable.IncomingForm();

  let upload = path.join("./public", "upload");
  form.uploadDir = path.join(process.cwd(), upload);
  form.parse(req, function(err, fields, files) {
    // console.log(fields);
    if (err) {
      console.log(err);
      return next(err);
    }
    const valid = validationProducts(fields, files);
    if (valid.err) {
      fs.unlinkSync(files.photo.path);
      return res.redirect(`/?msg=${valid.status}`);
    }
    const fileName = path.join(upload, files.photo.name);
    // console.log(fileName);
    fs.rename(files.photo.path, fileName, function(err) {
      if (err) {
        console.error(err.message);
        return;
      }
      // console.log(fileName);
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
      // console.log(dir);

      db.set(dir, {
        name: fields.name,
        price: fields.price
      });
      db.save();
      res.redirect("/admin?msg=Картинка успешно загружена");
    });
  });
};

const validationProducts = (fields, files) => {
  // console.log(fields);
  // console.log(files);
  if (files.photo.name === "" || files.photo.size === 0) {
    return { status: "Не загружена картинка!", err: true };
  }
  if (!fields.name) {
    return { status: "Не указано описание картинки!", err: true };
  }
  return { status: "Ok", err: false };
};
const validationSkills = (fields, files) => {
  // console.log(fields);
  // console.log(files);
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
