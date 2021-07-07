var express = require("express");
var path = require("path");
var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("/", function(req, res, next) {
  setTimeout(() => {
    var date = new Date();
    clearInterval(interval);
    var newDate = `${date.getDate()}.${date.getMonth() +
      1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    next(newDate);
  }, process.env.TIMEOUT * 1000);

  var interval = setInterval(() => {
    var date = new Date();
    console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
  }, process.env.INTERVAL * 1000);
});

app.get("/", function(currentDate, req, res) {
  res.render("index", { currentTime: currentDate });
});

app.listen(3000, function() {
  console.log("app listenning on port 3000");
});

// console.log(process.env);
