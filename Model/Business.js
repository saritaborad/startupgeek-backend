const mongoose = require("mongoose");
const validator = require("validator");

const businessSchema = new mongoose.Schema(
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
    registration: {
      type: Number, // 1 for work myself.  , 2 for send me the necessary applications.
    },
    servicepay: {
      type: Number,
    },
    licenceNo: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
