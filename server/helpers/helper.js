const bcrypt = require("bcryptjs");
const path = require("path");

exports.encryptPassword = async password => await bcrypt.hash(password, 10);
exports.comparePassword = async (password, hash) => {
  var match = await bcrypt.compare(password, hash);
  console.log(match);
  return match;
};
exports.uploadDir = path.join("./build", "images", "upload");
