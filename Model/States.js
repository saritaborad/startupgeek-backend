const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  name: {
    type: String,
  },
  isoCode: {
    type: String,
  },
  countryCode: {
    type: String,
  },
});

const states = mongoose.model("State", stateSchema);
module.exports = states;
