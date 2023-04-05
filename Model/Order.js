const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
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
    BillingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Billing",
    },
    order_no: {
      type: Number,
    },
    // service_type: {
    //   type: String,
    // },
    // service_title: {
    //   type: String,
    // },
    // duration: {
    //   type: String,
    // },
    total: {
      type: Number,
    },
    payment_method: {
      type: String,
    },
    email: {
      type: String,
    },
    pyment_status: {
      type: String, // succeeded, pending, failed
    },
    charge_id: {
      type: String
    },
    dateTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", OrderSchema);
