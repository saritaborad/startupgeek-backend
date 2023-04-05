const mongoose = require("mongoose");
const validator = require("validator");

const memberSchema = new mongoose.Schema(
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
    member: [
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
        Ownership: {
          type: Number,
          default: null,
        },
        companyType: {
          type: Number,
          default: 1, // 1 for individual , 2 for company
        },
        company_name: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
