const mongoose = require("mongoose");

const connectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    isGoogle: {
      type: Number,
      default: 1,
    },
    googleEmail: {
      type: String,
      trim: true,
    },
    isFacebook: {
      type: Number,
      default: 1,
    },
    facebookEmail: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
connectSchema.index({ user: 1 });
const SocailConnect = mongoose.model("SocialConnect", connectSchema);
module.exports = SocailConnect;
