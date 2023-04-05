const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
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
      // unique: [true, "user is registered on the given contact no"],
      // validate(value){
      //     if(!validator.isMobileNumber(value))
      //     {
      //         throw new Error("Please Enter Valid Email");
      //     }
      // }
    },
    password: {
      type: String,
      trim: true,
      select: false,
    },
    fname: {
      type: String,
    },
    lname: {
      type: String,
    },
    status: {
      type: Boolean,
    },
    profile_img: {
      type: String,
      default: "https://rentechtest112.s3.amazonaws.com/starprospect/post/T124znRdVl.png",
    },
    otp: {
      type: Number,
      trim: true,
      select: false,
    },
    bussiness: {
      type: String,
    },
    resetToken: {
      type: String,
    },
    token_timestamp: {
      type: Date,
      select: false,
    },
    country: {
      type: String,
    },
    plan: {
      type: String,
    },
    customer_id: {
      type: String,
    },
    role: {
      type: Number,
      default: 0, // 1 for admin, 0 for vendor
    },
    is_varified: {
      type: Number,
      default: 0,
    },
    is_social: {
      type: Number,
      default: 0,
    },
    // social_token:{
    //     type:String
    // },
    // social_type:{
    //     type:String
    // },
    google_login: {
      type: Number,
      default: 0, //0 means deactive 1 means active
    },
    facebook_login: {
      type: Number,
      default: 0, //0 means deactive 1 means active
    },
    google_social_token: {
      type: String,
    },
    facebook_social_token: {
      type: String,
    },
    google_social_id: {
      type: String,
    },
    facebook_social_id: {
      type: String,
    },
    social_id: {
      type: String,
    },
    social_type: {
      type: String,
    },
    social_token: {
      type: String,
    },
  },
  { timestamps: true }
);

//encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// company information
userSchema.virtual("company", {
  ref: "Company",
  localField: "_id",
  foreignField: "userid",
  justOne: false,
});
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

userSchema.virtual("companyCount", {
  ref: "Company",
  localField: "_id",
  foreignField: "userid",
  justOne: false,
  count: true,
});
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

//Sign JWT and Return
userSchema.methods.generateAuthToken = async function () {
  //console.log("hjugh");
  const token = jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRE_IN });
  //console.log(token);
  return token;
};

//generate and hash token
userSchema.methods.getResetPasswordToken = async function () {
  const user = this;
  var resetToken = Math.random().toString(36);
  resetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  //  resetToken = crypto.createHash('sha256').update(resetToken).digest("hex");
  resetToken = resetToken.toString().substr(10, 32);
  (user.resetToken = resetToken), (user.token_timeStamp = new Date());
  await user.save();
  return resetToken;
};

userSchema.methods.getVerificationToken = async function () {
  const user = this;
  var verificationToken = Math.random().toString(36);
  verificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  verificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  verificationToken = verificationToken.toString().substr(10, 50);
  await user.save();
  return verificationToken;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return "UNREGISTER";
  }
  if (user.status == 0) {
    return "UNVERIFIED";
  }
  if (user.status == 2) {
    return "BLOCKED";
  }
  let isMatch = false;
  isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return "UNMATCHED";
  } else {
    return user;
  }
};

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
