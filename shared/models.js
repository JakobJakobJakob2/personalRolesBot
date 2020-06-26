const mongoose = require('mongoose');

module.exports.roleSchema = new mongoose.Schema({
    userID: String,
    roleID: String
  });

  module.exports.optionSchema = new mongoose.Schema({
    guildId: String,
    options: Object,
    bottomRole: Number
  })