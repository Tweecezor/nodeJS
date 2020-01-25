var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const helper = require("../helpers/helper");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const util = require("util");
const rename = util.promisify(fs.rename);
const platform = process.platform;

var jwt = require("jsonwebtoken");

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

const User = require("../models");

var jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "secret"
};

var strategy = new JwtStrategy(jwtOptions, async function(jwt_payload, next) {
  mongoose
    .connect("mongodb://localhost:27017/projectDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected"))
    .catch(err => console.log(err));
  console.log("payload received", jwt_payload);
  // usually this would be a database call:
  var userid = jwt_payload.id;
  var user = await User.findById(userid);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use(strategy);

router.post("/api/registration", async (req, res, next) => {
  await mongoose
    .connect("mongodb://localhost:27017/projectDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected"))
    .catch(err => console.log(err));
  // console.log(await helper.encryptPassword(req.body.password));
  const user = new User({
    firstName: req.body.firstName,
    surName: req.body.surName,
    middleName: req.body.middleName,
    username: req.body.username,
    password: await helper.encryptPassword(req.body.password),
    image: "",
    permission: {
      chat: { C: false, R: true, U: true, D: true },
      news: { C: false, R: true, U: true, D: false },
      settings: { C: false, R: false, U: false, D: false }
      // admin\/

      // chat: { C: true, R: true, U: true, D: true },
      // news: { C: true, R: true, U: true, D: true },
      // settings: { C: true, R: true, U: true, D: true }
    },
    accessToken: "",
    refreshToken: "",
    accessTokenExpiredAt: Date.now(),
    refreshTokenExpiredAt: Date.now()
  });
  await user
    .save()
    .then(doc => {
      mongoose.disconnect();
      return doc;
    })
    .catch(function(err) {
      console.log(err);
      mongoose.disconnect();
    });
  // console.log(user);
  res.send(user);
});

router.post("/api/login", async (req, res, next) => {
  // if (!req.body.username && !req.body.password) {
  //   return res.status(401).json({ message: "Заполните поля" });
  // }
  mongoose
    .connect("mongodb://localhost:27017/projectDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected to db"))
    .catch(err => console.log(err));
  var user = await User.find({ username: req.body.username });
  user = user[0];
  if (!user) {
    res.status(401).send({ message: "Пользователь не найден" });
  }
  // console.log(req.body.password);
  // console.log(user.password);
  // console.log(helper.comparePassword(req.body.password, user.password));
  var match = await helper.comparePassword(req.body.password, user.password);
  // console.log(match);
  if (match) {
    var payload = { id: user.id };
    var token = jwt.sign(payload, jwtOptions.secretOrKey);
    var refreshToken = jwt.sign(payload, jwtOptions.secretOrKey);
    await User.findByIdAndUpdate(user.id, {
      accessToken: token,
      refreshToken: refreshToken,
      accessTokenExpiredAt: Date.now() + 60 * 60 * 1000,
      refreshTokenExpiredAt: Date.now() + 60 * 60 * 1000 * 10
    });
    var authUser = await User.findById(user.id);
    // console.log(authUser);
    mongoose.disconnect();
    res.send(authUser);
    // res.json({ message: "ok", token: token });
  } else {
    mongoose.disconnect();
    res.status(401).send({ message: "passwords did not match" });
  }

  // console.log(user.password);
  // console.log(req.body.password);
  // if (user) {
  //   if (user.password !== req.body.password) {
  //     return res.status(401).json({ message: "Неверный пароль" });
  //   }
  //   return res.send(user);
  // } else {
  //   return res
  //     .status(401)
  //     .json({ message: "Такой пользователь не зарегистрирован" });
  // }
});

router.get("/api/profile", async function(req, res) {
  mongoose
    .connect("mongodb://localhost:27017/projectDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected to db"))
    .catch(err => console.log(err));

  let authorization = req.headers.authorization;
  // console.log(authorization);
  var decoded = jwt.verify(authorization, jwtOptions.secretOrKey);
  // console.log(decoded);
  var userId = decoded.id;
  var user = await User.findById(userId);
  console.log(user);
  res.send(user);
});

router.patch("/api/profile", async function(req, res) {
  mongoose
    .connect("mongodb://localhost:27017/projectDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected to db"))
    .catch(err => console.log(err));
  let authorization = req.headers.authorization;
  var decoded = jwt.verify(authorization, jwtOptions.secretOrKey);
  var userId = decoded.id;

  var form = formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), helper.uploadDir);

  form.parse(req, async function(err, fields, files) {
    // console.log(fields);
    if (err) {
      mongoose.disconnect();
      return res.status(400).send({ error: "Ошибка!" });
    }

    if (files.avatar) {
      const fileName = path.join(helper.uploadDir, files.avatar.name);
      var errRename = await rename(files.avatar.path, fileName);
      if (errRename) {
        return res.status(400).send({ error: "Ошибка загрузки файла!" });
      }
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
      // console.log(fields.oldPassword);
      if (fields.oldPassword || fields.newPassword) {
        var currentUser = await User.findById(userId);
        var match = await helper.comparePassword(
          fields.oldPassword,
          currentUser.password
        );
        if (match) {
          await User.findByIdAndUpdate(userId, {
            firstName: fields.firstName,
            middleName: fields.middleName,
            surName: fields.surName,
            password: await helper.encryptPassword(fields.newPassword),
            image: dir
          });
          await User.findById(userId, function(err, person) {
            // console.log(person);
            res.send(person);
          });
          // var updated = await User.findByIdAndUpdate(userId, {
          //   firstName: fields.firstName,
          //   middleName: fields.middleName,
          //   surName: fields.surName,
          //   password: fields.newPassword,
          //   image: dir
          // });
          // console.log(updated);
          // res.send(updated);
        } else {
          console.log("не тот пароль ");
          mongoose.disconnect();
          return res.status(401).send({ message: "Старый пароль неверный" });
        }
      } else {
        await User.update(
          { _id: userId },
          {
            firstName: fields.firstName,
            middleName: fields.middleName,
            surName: fields.surName,
            image: dir
          },
          function(err, person) {
            console.log(person);
          }
        );
        await User.findById(userId, function(err, person) {
          console.log(person);
          mongoose.disconnect();
          res.send(person);
        });
        // User.findByIdAndUpdate(
        //   userId,
        //   {
        //     firstName: fields.firstName,
        //     middleName: fields.middleName,
        //     surName: fields.surName,
        //     image: dir
        //   },
        //   function(err, person) {
        //     console.log(person);
        //   }
        // );
        // console.log(updated);
        // res.send(updated);
      }
    } else {
      if (fields.oldPassword || fields.newPassword) {
        currentUser = await User.findById(userId);
        match = await helper.comparePassword(
          fields.oldPassword,
          currentUser.password
        );
        if (match) {
          await User.findByIdAndUpdate(userId, {
            firstName: fields.firstName,
            middleName: fields.middleName,
            surName: fields.surName,
            password: await helper.encryptPassword(fields.newPassword)
          });
          await User.findById(userId, function(err, person) {
            // console.log(person);
            res.send(person);
          });
        } else {
          console.log("не тот пароль ");
          mongoose.disconnect();
          return res.status(401).send({ message: "Старый пароль неверный" });
        }
      } else {
        await User.update(
          { _id: userId },
          {
            firstName: fields.firstName,
            middleName: fields.middleName,
            surName: fields.surName
          },
          function(err, person) {
            console.log(person);
          }
        );
        await User.findById(userId, function(err, person) {
          console.log(person);
          mongoose.disconnect();
          res.send(person);
        });
      }
    }
  });
});

router.delete("/api/users/:id", async function(req, res, next) {
  mongoose
    .connect("mongodb://localhost:27017/projectDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected to db"))
    .catch(err => console.log(err));
  User.deleteOne({ id: req.params["id"] }, function(err, doc) {
    if (err) return res.status(401).send({ message: err });
    mongoose.disconnect();
    res.send(doc);
  });
});

router.get("/api/users", (req, res, next) => {
  mongoose
    .connect("mongodb://localhost:27017/projectDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected to db"))
    .catch(err => console.log(err));
  User.find()
    .then(function(doc) {
      console.log(doc);
      mongoose.disconnect();
      res.send(doc);
    })
    .catch(function(err) {
      mongoose.disconnect();
      return res.status(401).send({ message: err });
    });
});

module.exports = router;
