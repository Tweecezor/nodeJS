const path = require("path");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync(path.join(__dirname, "myKoaDB.json"));
const db = low(adapter);
db.defaults({ products: [], skills: {} }).write();

module.exports = db;
