const mongoose = require("mongoose");
const validator = require("validator");

const billingSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPlan",
    },
    company_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    billInfo: {
      fname: {
        type: String,
        trim: true,
      },
      lname: {
        type: String,
        trim: true,
      },
      street_address: {
        type: String,
      },
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      zip_code: {
        type: Number,
      },
      country: {
        type: String,
      },
    },
    Card_Number: {
      type: Number,
    },
    month: {
      type: Number,
    },
    year: {
      type: Number,
    },
    expiry_date: {
      type: Date,
    },
    CVV: {
      type: Number,
    },
    // orderId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Order",
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Billing", billingSchema);
