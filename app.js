const path = require("path");
const Koa = require("koa");
const fs = require("fs");
const serve = require("koa-static");
const Pug = require("koa-pug");
const session = require("koa-session");
// var Router = require("koa-router");
// const router = new Router();

const app = new Koa();

const pug = new Pug({
  app: app,
  viewPath: "./source/views",
  basedir: "./source/views"
});

app.use(serve(path.join(__dirname, "public")));
app.use(
  session(
    {
      key: "koa:sess",
      maxAge: 10 * 60 * 1000,
      autoCommit: true,
      overwrite: true,
      httpOnly: true,
      // signed: true,
      rolling: false,
      renew: false
    },
    app
  )
);

const router = require("./source/routes/index");

// router.get("/", async (ctx, next) => {
//   return await ctx.render("views/pages/index");
// });

app.use(router.routes());

let upload = path.join("./public", "uploads");

app.listen(3000, function() {
  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload);
  }
  console.log("server is active");
});

// app.set("views", path.join(__dirname, "source", "views"));
// app.set("view engine", "pug");

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.use(
//   session({
//     secret: "mySecretWord",
//     key: "sessionkey",
//     cookie: {
//       path: "/",
//       httpOnly: true,
//       maxAge: 5 * 60 * 1000
//     },
//     saveUninitialized: false,
//     resave: false
//   })
// );

// app.use(express.static(path.join(__dirname, "public")));

// app.use("/", require("./source/routes/index"));

// let upload = path.join("./public", "upload");

// if (!fs.existsSync(upload)) {
//   fs.mkdirSync(upload);
// }

// const server = app.listen(3001, function() {
//   if (!fs.existsSync(upload)) {
//     fs.mkdirSync(upload);
//   }
//   console.log("Сервер был запущен");
// });
