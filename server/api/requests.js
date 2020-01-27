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

// локальная БД mongodb://localhost:27017/projectDB

var jwt = require("jsonwebtoken");

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

const User = require("../models").user;
const News = require("../models").news;
console.log(User);

var jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "secret"
};

var strategy = new JwtStrategy(jwtOptions, async function(jwt_payload, next) {
  mongoose
    .connect(helper.mongoURL, {
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

//Ругистрация в системе
router.post("/api/registration", async (req, res, next) => {
  await mongoose
    .connect(helper.mongoURL, {
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
//Логирование в систему
router.post("/api/login", async (req, res, next) => {
  // if (!req.body.username && !req.body.password) {
  //   return res.status(401).json({ message: "Заполните поля" });
  // }
  mongoose
    .connect(helper.mongoURL, {
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

  var match = await helper.comparePassword(req.body.password, user.password);
  // console.log(match);
  if (match) {
    var payload = { id: user.id };
    var token = jwt.sign(payload, jwtOptions.secretOrKey);
    var refreshToken = jwt.sign(
      { id: user.id, name: user.username },
      jwtOptions.secretOrKey
    );
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
});

//Вход при наличии токена
router.get("/api/profile", async function(req, res) {
  mongoose
    .connect(helper.mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected to db"))
    .catch(err => console.log(err));
  let authorization = req.headers.authorization;
  console.log(authorization);
  var decoded = jwt.verify(authorization, jwtOptions.secretOrKey);
  // console.log(decoded);
  var userId = decoded.id;
  var user = await User.findById(userId);
  console.log(user);
  res.send(user);
});

//Обновление данных профиля
router.patch("/api/profile", async function(req, res) {
  mongoose
    .connect(helper.mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected to db"))
    .catch(err => console.log(err));
  let authorization = req.headers.authorization;
  console.log(authorization);
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

//Удаления юзера по ID

router.delete("/api/users/:id", async function(req, res, next) {
  mongoose
    .connect(helper.mongoURL, {
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

//Получение всех юзеров
router.get("/api/users", (req, res, next) => {
  mongoose
    .connect(helper.mongoURL, {
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

// Получение всех новостей
router.get("api/news", function(req, res, next) {
  mongoose
    .connect(helper.mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected to db"))
    .catch(err => console.log(err));
  News.find()
    .then(function(doc) {
      mongoose.disconnect();
      res.send(doc);
    })
    .catch(function(err) {
      mongoose.disconnect();
      return res.status(401).send({ message: err });
    });
});

router.post("api/news", async function(req, res, next) {
  mongoose
    .connect(helper.mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected to db"))
    .catch(err => console.log(err));
  let authorization = req.headers.authorization;
  console.log(authorization);
  var decoded = jwt.verify(authorization, jwtOptions.secretOrKey);
  var userId = decoded.id;
  console.log(userId);
  var currentUser = await User.findById(userId);
  const news = new News({
    created_at: Date.now(),
    text: req.body.text,
    title: req.body.title,
    user: {
      firstName: currentUser.firstName,
      id: currentUser.id,
      image: currentUser.image,
      middleName: currentUser.middleName,
      surName: currentUser.surName,
      username: currentUser.username
    }
  });
  await news.save();
  News.find()
    .then(doc => res.send(doc))
    .catch(err => {
      res.status(401).send({ message: err });
    });
});

router.patch("/api/news/:id", (req, res, next) => {
  mongoose
    .connect(helper.mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected to db"))
    .catch(err => console.log(err));
  News.findOneAndUpdate(
    { id: req.params["id"] },
    {
      text: req.body.text,
      title: req.body.title
    },
    function(err, doc) {
      if (err) return res.status(401).send({ message: err });
    }
  ).then(() => {
    News.find()
      .then(function(doc) {
        res.send(doc);
      })
      .catch(function(err) {
        return res.status(401).jsosendn({ message: err });
      });
  });
});

router.delete("/api/news/:id", (req, res, next) => {
  mongoose
    .connect(helper.mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected to db"))
    .catch(err => console.log(err));
  console.log(req.params["id"]);
  News.deleteOne({ id: req.params["id"] }, function(err, doc) {
    if (err) return res.status(401).send({ message: err });
  }).then(function(err, doc) {
    News.find()
      .then(function(doc) {
        res.send(doc);
      })
      .catch(function(err) {
        return res.status(401).send({ message: err });
      })
      .catch(function(err) {
        return res.status(401).send({ message: err });
      });
  });
});

router.patch("/api/users/:id/permission", (req, res, next) => {
  mongoose
    .connect(helper.mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(console.log("connected to db"))
    .catch(err => console.log(err));
  User.findOne({ id: req.params["id"] }, async function(err, doc) {
    if (err) return res.status(401).send({ message: err });
    doc.permission.chat.C = req.body.permission.chat.C;
    doc.permission.chat.R = req.body.permission.chat.R;
    doc.permission.chat.U = req.body.permission.chat.U;
    doc.permission.chat.D = req.body.permission.chat.D;

    doc.permission.news.C = req.body.permission.news.C;
    doc.permission.news.R = req.body.permission.news.R;
    doc.permission.news.U = req.body.permission.news.U;
    doc.permission.news.D = req.body.permission.news.D;

    doc.permission.settings.C = req.body.permission.settings.C;
    doc.permission.settings.R = req.body.permission.settings.R;
    doc.permission.settings.U = req.body.permission.settings.U;
    doc.permission.settings.D = req.body.permission.settings.D;
    await doc.save();
    User.find()
      .then(function(inpdoc) {
        res.send(inpdoc);
      })
      .catch(function(err) {
        return res.status(401).json({ message: err });
      });
  });
});

module.exports = router;
