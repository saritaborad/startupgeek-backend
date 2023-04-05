const mongoose = require("mongoose");

const userPlanSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    mainPlanType: {
      type: String, // 1 - company plan, 2 - service plan 3- default plan
    },
    entity_type: {
      type: String,
      enum: ["LLC", "S-Corporation", "C-Corporation", "Nonprofit"],
    },
    service_price: {
      type: String,
    },
    service_duration: {
      type: String,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
    },
    stateName: {
      type: String,
    },
    planid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PricingPlan",
    },
    servicePay: {
      type: Number,
      default: 0,
    },
    servicePurchased: [mongoose.Schema.Types.ObjectId],
    plan: [
      {
        plan_type: {
          type: String, // 1 - gold, 2 - silver, 3 - platinum
        },
        name: {
          type: String,
        },
        description: {
          type: String,
        },
        status: {
          type: String,
          default: 3, // 1 - active, 2 for inactive, 3 for draft
        },
        package_fee: {
          type: String,
        },
        state_fee: {
          type: String,
        },
        popular: {
          type: String,
          default: false,
        },
        priceid: {
          type: String,
        },
        features: ["Full courses library", "A new daily meditation"],
      },
    ],
    total: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserPlan", userPlanSchema);
