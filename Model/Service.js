const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    service_type: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ServiceModel = mongoose.model("Service", ServiceSchema);
module.exports = ServiceModel;
