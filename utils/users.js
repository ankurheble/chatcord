const UserModel = require("../models/UserModel");

// Join user to chat
function userJoin(data) {
  return new Promise((resolve, reject) => {
    UserModel.find({ socketId: data.socketId }, (err, res) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      if (res.length == 0) {
        UserModel.create(data, (err, user) => {
          if (err) {
            console.error("MongoError", err);
            return reject(err);
          }
          return resolve(user);
        });
      }
    });
  });
}

// Get current user
function getCurrentUser(id) {
  return new Promise((resolve, reject) => {
    UserModel.findOne({ socketId: id }, (err, user) => {
      if (err) {
        console.error("MongoError", err);
        return reject(err);
      }
      return resolve(user);
    });
  });
}

// User leaves chat
function userLeave(id) {
  return new Promise((resolve, reject) => {
    UserModel.findOneAndRemove({ socketId: id }, (err, user) => {
      if (err) {
        console.error("MongoError");
        reject(err);
      }
      return resolve(user);
    });
  });
}

// Get room users
function getRoomUsers(room) {
  return new Promise((resolve, reject) => {
    UserModel.find({ room: room })
      .then((users) => {
        users = users.map((user) => ({
          socketId: user.socketId,
          username: user.username,
          room: user.room,
        }));
        return resolve(users);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
};
