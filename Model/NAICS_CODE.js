const mongoose = require("mongoose");

const NaicsSchema = new mongoose.Schema({
  subcode: {
    type: String,
  },
  description: {
    type: String,
  },
  fullDescription: {
    type: String,
  },
  naicsCodes: {
    type: String,
  },
  naicsCodes_string: {
    type: String,
  },
  naicSubcodes: {
    type: String,
  },
  naicSubcodes_string: {
    type: String,
  },
  key_: {
    type: String,
  },
  id_: {
    type: String,
  },
});

const NaicsModel = mongoose.model("Naicscode", NaicsSchema);
module.exports = NaicsModel;
