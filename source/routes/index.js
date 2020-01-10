const express = require("express");
const router = express.Router();
const adminCTRL = require("../controller/admin");
// const adminSkillsCTRL = require("../controller/adminSkills");
const indexCTRL = require("../controller/index");
const loginCTRL = require("../controller/login");

const isLoged = (req, res, next) => {
  if (req.session.isLoged) {
    return next();
  } else res.redirect("/login");
};

// console.log("----");
// console.log(loginCTRL);

router.get("/", indexCTRL.get);
router.post("/", indexCTRL.post);

router.get("/admin", isLoged, adminCTRL.get);
router.post("/admin/upload", adminCTRL.upload);
router.post("/admin/skills", adminCTRL.skills);

router.get("/login", loginCTRL.get);
router.post("/login", loginCTRL.post);

module.exports = router;
