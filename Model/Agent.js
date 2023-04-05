const mongoose = require("mongoose");
const validator = require("validator");

const agentSchema = new mongoose.Schema(
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
    name: {
      type: String,
    },
    email: {
      type: String,
      // unique: [true, "agent is registered on the given email"],
    },
    role: {
      type: Number, // 0 user, 1 admin
    },
    profile_img: {
      type: String,
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
    company_name: {
      type: String,
    },
    country: {
      type: String,
    },
    status: {
      type: Number, //1 - First Party, 2 - Thirt Party
    },
    agentType: {
      type: Number, // 1 for Individual , 2 for Company
    },
    hireAgent: {
      type: Number, // 1 for hire company agent ,  2 for register own my agent
    },
    servicepay: {
      type: Number,
      default: 0,
    },
    agentStatus: {
      type: String, // 1 - active, 2- Inactive
      default: 1,
    },
    agentCompany: [
      {
        companyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Company",
        },
        // company_name: { type: String },
        start_date: { type: Date },
        end_date: { type: Date },
        task: { type: String },
        description: { type: String },
      },
    ],
    agentService: [
      {
        requestId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Request",
        },
        task: { type: String },
        description: { type: String },
      },
    ],
  },
  { timestamps: true }
);

agentSchema.virtual("userInfo", {
  ref: "User",
  localField: "userid",
  foreignField: "_id",
  justOne: true,
});
agentSchema.set("toObject", { virtuals: true });
agentSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Agent", agentSchema);
