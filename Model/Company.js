const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPlan",
    },
    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
    },
    company_type: {
      type: String, // company type in name --> LLC,  S-Corporation, C-Corporation, Nonprofit
      enum: ["LLC", "S-Corporation", "C-Corporation", "Nonprofit"],
    },
    Cname: {
      type: String,
      default: null,
    },
    designator: {
      type: String,
      default: null,
    },
    company_name: {
      type: String,
      // unique: [true, "company name already exist"]
    },
    industry: {
      type: String,
      default: null,
    },
    owners: {
      type: Number,
      default: 0,
    },
    business_purpose: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    authorized_no: {
      type: Number,
      default: 0,
    },
    share_value: {
      type: Number,
      default: 0,
    },
    shareholders_no: {
      type: Number,
      default: 0,
    },
    street_address: {
      type: String,
    },
    address: {
      type: String,
      default: null,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    entity_type: {
      type: String, // Business Type / Industry
    },
    formation_state: {
      type: String,
    },
    service_state: {
      type: String,
    },
    confirm_company_name: {
      type: String,
    },
    zip_code: {
      type: Number,
    },
    status: {
      type: Number,
      default: 0, // 1 for inactive, 2 for taken, 3 for available
    },
    // naics: {
    //   type: String,
    //   default: null,
    // },
    naicsCode: {
      type: String,
    },
    naicsSubCode: {
      type: String,
    },
    naicsCodes_string: {
      type: String,
    },
    naicSubcodes_string: {
      type: String,
    },
    naicsfullDescription: {
      type: String,
    },
    planstatus: {
      type: Boolean, // true= plan exist , false = plan cancel
    },
    agent_Request_flag: {
      type: Boolean, // true for request agent, false for not requested
      default: false,
    },
  },
  { timestamps: true }
);

companySchema.virtual("userplan", {
  ref: "UserPlan",
  localField: "userid",
  foreignField: "userid",
  justOne: true,
});

companySchema.set("toObject", { virtuals: true });
companySchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Company", companySchema);
