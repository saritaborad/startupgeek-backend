const mongoose = require("mongoose");

const companyNameSchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    status: {
      type: Number,
      default: 2, // 1 for inactive, 2 for taken, 3 for available
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CompanyName", companyNameSchema);
