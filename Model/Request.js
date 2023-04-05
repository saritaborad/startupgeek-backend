const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: {
      type: String,
    },
    userPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPlan",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    companyName: {
      type: String,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PricingPlan",
    },
    service_type: {
      type: String,
    },
    service_title: {
      type: String,
    },
    payment: {
      type: Number,
    },
    status: {
      type: Number, // 1-open, 2-In progress, 3-pending, 4-assignd, 5-resolved
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

RequestSchema.virtual("plan", {
  ref: "PricingPlan",
  localField: "serviceId",
  foreignField: "_id",
  justOne: true,
});
RequestSchema.set("toObject", { virtuals: true });
RequestSchema.set("toJSON", { virtuals: true });

RequestSchema.virtual("user", {
  ref: "User",
  localField: "userid",
  foreignField: "_id",
  justOne: true,
});
RequestSchema.set("toObject", { virtuals: true });
RequestSchema.set("toJSON", { virtuals: true });

RequestSchema.virtual("company", {
  ref: "Company",
  localField: "companyId",
  foreignField: "_id",
  justOne: true,
});
RequestSchema.set("toObject", { virtuals: true });
RequestSchema.set("toJSON", { virtuals: true });

RequestSchema.virtual("order", {
  ref: "Order",
  localField: "orderId",
  foreignField: "_id",
  justOne: true,
});
RequestSchema.set("toObject", { virtuals: true });
RequestSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Request", RequestSchema);
