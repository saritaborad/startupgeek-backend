const mongoose = require("mongoose");

const pricingPlanSchema = new mongoose.Schema(
  {
    mainPlanType: {
      type: String, // 1 - company plan, 2 - service plan 3- default plan
    },
    service_type: {
      type: String,
    },
    service_price: {
      type: String,
    },
    service_duration: {
      type: String,
    },
    service_title: {
      type: String,
    },
    service_desc: {
      type: String,
    },
    company_type: {
      type: String, // company type in name --> LLC,  S-Corporation, C-Corporation, Nonprofit
      enum: ["LLC", "S-Corporation", "C-Corporation", "Nonprofit"],
    },
    // companyType: {
    //   type: String, //1 - LLC, 2 - S-Corporation, 3 - C-Corporation, 4 - Nonprofit
    // },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
    },
    stateName: {
      type: String,
    },
    status: {
      type: String,
      enum: ["1", "2", "3"],
      default: 3, // 1 - active, 2 for inactive, 3 for draft
    },
    priceid: {
      type: String,
    },
    plan: [
      {
        plan_type: {
          type: String, // 1 - gold, 2 - silver, 3 - platinum
          enum: ["1", "2", "3"],
        },
        name: {
          type: String,
          enum: ["Gold", "Silver", "Platinum"],
        },
        description: {
          type: String,
        },

        package_fee: {
          type: String,
        },
        state_fee: {
          type: String,
        },
        popular: {
          type: Boolean,
          default: false,
        },
        priceid: {
          type: String,
        },
        features: ["Full courses library", "A new daily meditation"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const pricingPlan = mongoose.model("PricingPlan", pricingPlanSchema);
module.exports = pricingPlan;
