const mongoose = require("mongoose");
const validator = require("validator");

const personSchema = new mongoose.Schema(
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
    company_name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "user is registered on the given email"],
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Please Enter Valid Email");
        }
      },
    },
    phone: {
      type: String,
      trim: true,
      unique: [true, "user is registered on the given contact no"],
      // validate(value){
      //     if(!validator.isMobileNumber(value))
      //     {
      //         throw new Error("Please Enter Valid Email");
      //     }
      // }
    },
    fname: {
      type: String,
      trim: true,
    },
    lname: {
      type: String,
      trim: true,
    },
    profile_img: {
      type: String,
      default: "https://rentechtest112.s3.amazonaws.com/starprospect/post/T124znRdVl.png",
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
  { timestamps: true }
);

module.exports = mongoose.model("Contact", personSchema);
