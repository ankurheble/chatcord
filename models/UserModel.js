const mongoose = require("mongoose");

const Users = mongoose.Schema({
  socketId: String,
  username: String,
  room: String,
});

module.exports = mongoose.model("Users", Users);