const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs");
const session = require("express-session");
// const router = express.Router();
const bodyParser = require("body-parser");
const chat = require("./server/chat");
const http = require("http");
const server = http.createServer(app);
chat(server);

//

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// router.get("/", (req, res, next) => {
//   res.render("index.html");
// });
// router.post("/api/login", (req, res, next) => {
//   console.log("hello");
// });
app.use(
  session({
    secret: "loftSecret",
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 10 * 60 * 1000
    },
    saveUninitialized: false,
    resave: false
  })
);

app.use(express.static(path.join(__dirname, "build"))); //статика всегда перед раутами

app.use("/", require(path.join(__dirname, "server", "api"))); //рауты последний промежуточное ПО

app.get("*", (req, res) => {
  res.send(
    fs.readFileSync(path.resolve(path.join("public", "index.html")), "utf8")
  );
});
let upload = path.join("./build", "images", "upload");

if (!fs.existsSync(upload)) {
  console.log("не существует");
  fs.mkdirSync("./build/images");
  fs.mkdirSync("./build/images/upload");
}

server.listen(3000, () => {
  console.log("server is ready");
});
