var users = [];
var messages = [];
module.exports = server => {
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
};
