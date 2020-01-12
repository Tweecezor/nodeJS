const path = require("path");
const Koa = require("koa");
const fs = require("fs");
const serve = require("koa-static");
const Pug = require("koa-pug");
const session = require("koa-session");
const flash = require("koa-connect-flash");

// var Router = require("koa-router");
// const router = new Router();

const app = new Koa();
// app.keys = ["newest secret key", "older secret key"];

const pug = new Pug({
  app: app,
  viewPath: "./source/views",
  basedir: "./source/views"
});

app.use(serve(path.join(__dirname, "public")));
app.use(
  session(
    {
      key: "koa:session",
      maxAge: 10 * 60 * 1000,
      autoCommit: true,
      overwrite: true,
      httpOnly: true,
      rolling: false,
      signed: false,
      renew: false
    },
    app
  )
);
app.use(flash());
const router = require("./source/routes/index");
app.use(router.routes());

let upload = path.join("./public", "uploads");

app.listen(3000, function() {
  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload);
  }
  console.log("server is active");
});
