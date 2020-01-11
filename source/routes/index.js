// const express = require("express");
// const router = express.Router();
const path = require("path");
var Router = require("koa-router");
const router = new Router();
const adminCTRL = require("../controller/admin");
// const adminSkillsCTRL = require("../controller/adminSkills");
const indexCTRL = require("../controller/index");
const loginCTRL = require("../controller/login");
var koaBody = require("koa-body");

const isLoged = async (ctx, next) => {
  if (ctx.cookies.get("isLoged")) {
    return next();
  } else ctx.redirect("/login");
};

// console.log("----");
// console.log(loginCTRL);

router.get("/", indexCTRL.get);
// router.get("/", async (ctx, next) => {
//   await ctx.render("pages/index");
// });
router.post("/", koaBody(), indexCTRL.post);

router.get("/admin", isLoged, adminCTRL.get);
let upload = path.join("/public", "uploads");
router.post(
  "/admin/upload",
  koaBody({
    formidable: { uploadDir: path.join(process.cwd(), upload) },
    multipart: true
  }),
  adminCTRL.upload
);
router.post("/admin/skills", koaBody(), adminCTRL.skills);

router.get("/login", loginCTRL.get);
router.post("/login", koaBody(), loginCTRL.post);

module.exports = router;
