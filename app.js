const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs");
const session = require("express-session");
// const router = express.Router();
const bodyParser = require("body-parser");
// const chat = require("./server/chat");
const http = require("http");
const server = http.createServer(app);
// chat(server);
var users = [];
var messages = [];
const io = require("socket.io").listen(server);
// io.on("connection", function connection(socket) {
//   console.log("connect");
//   // console.log(socket);
//   socket.send("hello");
// });

io.on("connection", function connection(socket) {
  socket.on("users:connect", data => {
    console.log(data.userId);
    let user = {
      username: data.username,
      socketId: socket.id,
      userId: data.userId,
      activeRoom: null
    };
    console.log(user);
    users.push(user);
    socket.emit("users:list", users);
    socket.emit("users:add", users);
  });

  socket.on("message:add", function(data) {
    console.log(data);
    let message = {
      text: data.text,
      senderId: data.senderId,
      recipientId: data.recipientId
    };
    console.log(message);
    for (var user in users) {
      if (users.userId === data.senderId) {
        user.activeRoom = data.roomId;
      }
    }
    messages.push(message);
    socket.emit("message:add", message);
  });

  socket.on("message:history", function(data) {
    let send_messages = [];
    messages.forEach(msg => {
      if (
        (msg.senderId === data.recipientId &&
          msg.recipientId === data.userId) ||
        (msg.senderId === data.userId && msg.recipientId === data.recipientId)
      ) {
        send_messages.push(msg);
      }
    });
    console.log(send_messages);
    socket.emit("message:history", send_messages);
  });
  socket.on("disconnect", () => {
    socket.emit("users:leave", socket.id);
    users = users.filter(function(obj) {
      return obj.socketId !== socket.id;
    });
  });
});

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
