const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { addMessage } = require("./utils/messages");
const mongoose = require("mongoose");

//Connect to Mongo
mongoose.connect(
  "mongodb://localhost:27017",
  {
    dbName: "chatcord",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("Connected to Mongo successfully!");
  }
);

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatCord Bot";

// Run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const socketId = socket.id;
    userJoin({ socketId, username, room })
      .then((user) => {
        socket.join(room);

        // Welcome current user
        addMessage(botName, room, "Welcome to ChatCord!", true)
          .then((res) => socket.emit("message", res))
          .catch((err) => console.error(err));

        // Broadcast when a user connects
        addMessage(botName, room, `${user.username} has joined the chat`, true)
          .then((res) => {
            socket.broadcast.to(user.room).emit("message", res);
          })
          .catch((err) => console.error(err));

        // Send users and room info
        getRoomUsers(user.room).then((users) => {
          io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: users,
          });
        });
      })
      .catch((err) => console.error(err));
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    getCurrentUser(socket.id)
      .then((user) => {
        if (user && user.room) {
          addMessage(user.username, user.room, msg, false)
            .then((res) => {
              io.to(user.room).emit("message", res);
            })
            .catch((err) => console.error(err));
        }
      })
      .catch((err) => {
        console.error("error", err);
      });
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    userLeave(socket.id)
      .then((user) => {
        if (user) {
          addMessage(botName, user.room, `${user.username}  has left the chat`, true)
            .then((res) => {
              io.to(user.room).emit("message", res);
              // Send users and room info
              io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
              });
            })
            .catch((err) => console.error(err));
        }
      })
      .catch((err) => console.error(err));
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
