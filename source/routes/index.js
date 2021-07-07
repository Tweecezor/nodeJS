const path = require("path");
var Router = require("koa-router");
const router = new Router();
const adminCTRL = require("../controller/admin");
const indexCTRL = require("../controller/index");
const loginCTRL = require("../controller/login");
const flash = require("koa-connect-flash");
const koaBody = require("koa-body");

const isLoged = async (ctx, next) => {
  if (ctx.session.isLoged) {
    return await next();
  } else await ctx.redirect("/login");
};

// console.log("----");
// console.log(loginCTRL);

router.get("/", indexCTRL.get);
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
