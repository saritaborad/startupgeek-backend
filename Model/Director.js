const mongoose = require("mongoose");
const validator = require("validator");

const directorSchema = new mongoose.Schema(
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
    director: [
      {
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
      },
    ],
    president: {
      type: String,
    },
    secretary: {
      type: String,
    },
    treasurer: {
      type: String,
    },
    vice_president: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Director", directorSchema);
