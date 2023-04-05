const mongoose = require("mongoose");
const validator = require("validator");

const shareholderSchema = new mongoose.Schema(
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
    shareholders: [
      {
        fname: {
          type: String,
        },
        lname: {
          type: String,
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
          type: String,
        },
        ssn: {
          type: String,
        },
        no_of_shares: {
          type: Number,
        },
      },
    ],
    phone: {
      type: String,
      trim: true,
    },
    representative_name: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shareholder", shareholderSchema);
