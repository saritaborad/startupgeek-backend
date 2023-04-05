const mongoose = require("mongoose");

const newsLetterSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    sent: [mongoose.Schema.Types.ObjectId],
  },
  {
    timestamps: true,
  }
);

const newsLetter = mongoose.model("Newsletter", newsLetterSchema);
module.exports = newsLetter;
