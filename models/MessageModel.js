const mongoose = require("mongoose");

const Messages = mongoose.Schema({
  username: String,
  text: String,
  room: String,
  time: String,
});

module.exports = mongoose.model("Messages", Messages);
