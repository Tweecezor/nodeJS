const formidable = require("formidable");
const dbSkills = require("../models/skills-db")();

module.exports = function(req, res, next) {
  console.log("внутри skills");
  console.log(dbSkills.stores.file.store);
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
    dbSkills.set("age", {
      number: fields.age,
      text: "Возраст начала занятий на скрипке"
    });
    dbSkills.set("concerts", {
      number: fields.concerts,
      text: "Концертов отыграл"
    });
    dbSkills.set("cities", {
      number: fields.cities,
      text: "Максимальное число городов в туре"
    });
    dbSkills.set("years", {
      number: fields.years,
      text: "Лет на сцене в качестве скрипача"
    });
    dbSkills.save();
    res.redirect("/admin?msgs=Данные успешно обновлены");
  });
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
