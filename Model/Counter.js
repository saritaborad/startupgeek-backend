const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  count: 0,
});

module.exports = mongoose.model("Counter", counterSchema);
