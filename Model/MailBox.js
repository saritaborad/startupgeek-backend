const mongoose = require("mongoose");

const MailBoxSchema = new mongoose.Schema(
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
    document: {
      type: Array,
    },
    email: {
      type: String,
    },
    mail_type: {
      type: Number,
      enum: [1, 2], // 1 company email, 2 user email
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

const MailBox = mongoose.model("MailBox", MailBoxSchema);
module.exports = MailBox;
