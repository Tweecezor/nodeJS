var express = require("express");
var path = require("path");
var app = express();
var bodyParser = require("body-parser");
var session = require("express-session");
var fs = require("fs");

app.set("views", path.join(__dirname, "source", "views"));
app.set("view engine", "pug");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "mySecretWord",
    key: "sessionkey",
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 5 * 60 * 1000
    },
    saveUninitialized: false,
    resave: false
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/", require("./source/routes/index"));

let upload = path.join("./public", "upload");

if (!fs.existsSync(upload)) {
  fs.mkdirSync(upload);
}

const server = app.listen(3001, function() {
  console.log("Сервер был запущен");
});
