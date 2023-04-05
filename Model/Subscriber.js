const mongoose = require("mongoose");
const validator = require("validator");

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: [true, "Email already exists"],
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Please Enter Valid Email");
        }
      },
    },
    status: {
      type: Number,
      default: 1, // 1 for unscbscribed 2 for subscribed
    },
  },
  {
    timestamps: true,
  }
);

const Subscribers = mongoose.model("Subscriber", subscriberSchema);
module.exports = Subscribers;
