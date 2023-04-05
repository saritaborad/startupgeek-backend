const router = require("express").Router();
const { giveresponse } = require("../helper/res_help");
const { protect } = require("../middleware/auth");
const Connect = require("../Model/Connect");
const User = require("../Model/User");
const asynchandlar = require("../middleware/async");

router.post("/connect", protect, async (req, res) => {
  try {
    let acc,
      isMatchConnect = false;
    const { isGoogle, isFacebook } = req.body;
    const user = await User.find({ email: req.body.email });
    if (user.length == 0) {
      let data = {};
      if (isGoogle != undefined && isGoogle == 1) {
        let connect = await Connect.find({ googleEmail: req.body.email, isGoogle: 1 });
        acc = "Google";
        if (connect.length == 0) {
          connect.isGoogle = req.body.isGoogle;
          connect.googleEmail = req.body.email;
          user.google_social_token = req.body.social_login_token;
          user.google_social_id = req.body.social_id;
        } else {
          isMatchConnect = true;
        }
      } else if (isFacebook != undefined && isFacebook == 1) {
        let connect = await Connect.find({ facebookEmail: req.body.email, isfaceBook: 1 });
        acc = "Facebook";
        if (connect.length == 0) {
          connect.isFacebook = req.body.isFacebook;
          connect.facebookEmail = req.body.email;
          user.facebook_social_token = req.body.social_login_token;
          user.facebook_social_id = req.body.social_id;
        } else {
          isMatchConnect = true;
        }
      }

      if (isMatchConnect) {
        giveresponse(res, 201, false, `${acc} Account is already in used with email ${req.body.email}`);
      } else {
        const connect = await Connect.findOneAndUpdate({ user: user._id }, data, { upsert: true, new: true });
        user.google_login = connect.isGoogle;
        user.facebook_login = connect.isFacebook;
        user.is_social = 1;
        connect.save();
        console.log(user);
        //  user.save();
        giveresponse(res, 200, true, `${acc} Account connected Successfully`, connect);
      }
    } else {
      giveresponse(res, 201, false, "Please connect account with other email, it has been already in use");
    }
  } catch (error) {
    console.log(error);
    // giveresponse(res, 500, false, "Server Error", error)
  }
});

module.exports = router;
