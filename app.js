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
