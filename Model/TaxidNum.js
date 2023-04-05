const mongoose = require("mongoose");
const validator = require("validator");

const taxidSchema = new mongoose.Schema(
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
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zip_code: {
      type: Number,
    },
    EIN_Type: {
      type: Number, // 1 - ITIN, 2 - EIN
    },
    ein2Text: {
      type: String,
    },
    servicepay: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaxId_num", taxidSchema);
