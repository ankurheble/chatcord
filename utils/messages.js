const MessageModel = require("../models/MessageModel");
const moment = require("moment");

function addMessage(username, room, text, isBot) {
  return new Promise((resolve, reject) => {
    const data = { username, room, text, time: moment().format("h:mm a") };
    if (!isBot) {
      MessageModel.create(data)
        .then(() => resolve(data))
        .catch((err) => reject(err));
    }
    return resolve(data);
  });
}

module.exports = {
  addMessage,
};
