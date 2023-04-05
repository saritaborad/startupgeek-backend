const { giveresponse } = require("../helper/res_help.js");
const User = require("../Model/User");
const Connect = require("../Model/Connect");
const sendMail = require("../helper/mailer");
const sendSms = require("../helper/message_sender");
const asynchandler = require("../middleware/async");
const asyncHandler = require("../middleware/async");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const firebaseConfig = require("../firebase/firebase_config");
const jwt = require("jsonwebtoken");

// user sign up (create user)
exports.signup = asynchandler(async (req, res) => {
  const exists = await User.findOne({
    email: req.body.email,
    phone: req.body.phone,
    is_varified: 0,
  });

  if (exists) {
    giveresponse(res, 201, false, "Email or Phone Number Already exist please try with other");
  } else {
    const exists = await User.findOne({
      email: req.body.email,
      phone: req.body.phone,
      is_varified: 1,
    });

    const socialExists = await Connect.find({ $or: [{ googleEmail: req.body.email }, { facebookEmail: req.body.email }] });

    if (exists) {
      //return res.status(400).send('email already exists');
      giveresponse(res, 201, false, "email/phone_number already exists");
    } else if (socialExists > 0) {
      giveresponse(res, 201, false, "Email exist please try with other");
    } else {
      const { fname, lname, phone, email } = req.body;
      const user = new User({ fname, lname, phone, email });
      user.status = 1;
      user.device_type = req.header("device-type");

      await user.save();
      const resetToken = await user.getResetPasswordToken();
      user.resetToken = resetToken;
      const customer = await stripe.customers.create({
        email: req.body.email,
        name: req.body.fname,
        phone: req.body.phone,
      });
      user.customer_id = customer.id;
      user.save();

      const URL = process.env.LIVE == 1 ? process.env.ADMINFRONTURL : process.env.LOCALURL;
      const link = `${URL}/setpassword?${user.resetToken}`;

      const subject = "Your Startup Geeks account Password";
      const message = `We have sent a password reset link to your registered email ID ${link}`;

      await sendMail(req.body.email, subject, message);
      // await sendSms(req.body.contact_no, message);

      giveresponse(res, 200, true, "user created Successfully!", user);
    }
  }
});

exports.socialLogin = asyncHandler(async (req, res, next) => {
  var userdetail = firebaseConfig
    .auth()
    .verifyIdToken(req.body.idToken)
    .then(async ({ name, email, picture, uid, sign_in_provider }) => {
      const fname = name?.split(" ")[0];
      const lname = name?.split(" ")[1];
      const existUser = await User.findOne({ $and: [{ email: email }, { social_id: uid }] });
      if (!existUser) {
        const user = await new User({ email, fname, lname, profile_img: picture, social_id: uid, social_token: req.body.idToken, social_type: req.body.socialType });
        const token = await user.generateAuthToken();
        user.save();
        return giveresponse(res, 200, true, "Login successfull!", { user, token });
      } else {
        existUser.social_id = uid;
        existUser.social_token = req.body.idToken;
        existUser.social_type = req.body.socialType;
        const token = await existUser.generateAuthToken();
        return giveresponse(res, 200, true, "Login successfull!", { existUser, token });
      }
    });
});

// log in
exports.login = asynchandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return giveresponse(res, 400, false, " Please provide an email and password");
  }
  const user = await User.findOne({ email, role: 0 }).select("+password");
  // console.log(user);

  if (!user) {
    const user = await User.findOne({ email, role: 1 }).select("+password");
    if (!user) {
      return giveresponse(res, 400, false, "user does not exists");
    } else {
      //check if password matches

      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return giveresponse(res, 400, false, "Invalid credentials");
      }
      const token = await user.generateAuthToken();

      //const loginUser = await User.findOne({ email });
      delete user._doc.password;
      giveresponse(res, 200, true, "Login Successful!", { user, token });
    }
  }

  //check if password matches
  else {
    if (user.status == 0) {
      giveresponse(res, 400, false, "Unverfied user");
    } else if (user.status == 2) {
      giveresponse(res, 400, false, "disabled user");
    } else if (user.status == 3) {
      giveresponse(res, 400, false, "banned user");
    } else {
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return giveresponse(res, 400, false, "Invalid credentials");
      }
      const token = await user.generateAuthToken();

      //const loginUser = await User.findOne({ email });
      delete user._doc.password;
      giveresponse(res, 200, true, "Login Successful!", {
        user,
        token,
      });
    }
  }
});

exports.getUserInfo = asynchandler(async (req, res, next) => {
  const info = await User.findById({ _id: req.uId }).select("fname lname email phone profile_img createdAt");
  return giveresponse(res, 200, true, "User detail get successfully!", info);
});

//update user
exports.updateuser = asynchandler(async (req, res) => {
  const { fname, email, lname, profile_img, phone } = req.body;
  const updateUser = await User.findByIdAndUpdate(req.uId, { fname, email, lname, profile_img, phone }, { new: true, runValidators: true });
  giveresponse(res, 200, true, "user update successfully");
});

// set password
exports.setPassword = asynchandler(async (req, res) => {
  const user = await User.findOne({ resetToken: req.params.token }).select("+password");
  user.password = req.body.password;
  user.resetToken = "";
  user.save();
  const { password, ...info } = user._doc;
  giveresponse(res, 200, true, "password set successfully", info);
});

// forgot password
exports.forgotPassword = asynchandler(async (req, res) => {
  if (req.body.email != "" || req.body.phone == "") {
    var user = await User.findOne({ email: req.body.email });
    if (!user) {
      giveresponse(res, 400, false, "user does not exists");
    }
  } else if (req.body.email == "" || req.body.phone != "") {
    var user = await User.findOne({ phone: req.body.phone });
    if (!user) {
      giveresponse(res, 400, false, "user does not exists");
    }
  }
  const resetToken = await user.getResetPasswordToken();

  user.resetToken = resetToken;

  const URL = process.env.LIVE == 1 ? process.env.ADMINFRONTURL : process.env.LOCALURL;
  const link = `${URL}/reset-password?${user.resetToken}`;
  user.token_timestamp = new Date();
  user.save();

  const subject = "password-forgot";
  const message = `your forget password link is ${link}`;
  if (req.body.email != "" && req.body.phone == "") {
    await sendMail(req.body.email, subject, message);
  } else if (req.body.phone != "" && req.body.email == "") {
    await sendSms(req.body.phone, message);
  }
  giveresponse(res, 200, true, "We have sent a password reset link to your registered email ID", user);
});

// reset password
exports.reSet = asynchandler(async (req, res) => {
  const user = await User.findOne({ resetToken: req.params.token }).select("+password");
  if (new Date() - new Date(user?.token_timestamp) >= 900000) {
    return giveresponse(res, 201, false, "link time expire, please send again");
  } else {
    if (!user) {
      return giveresponse(res, 201, false, "invalid link or expired");
    } else {
      if (req.body.password) {
        const isMatch = await user.matchPassword(req.body.password);
        if (!isMatch) {
          user.password = req.body.password;
          user.resetToken = "";
          await user.save();

          if ((user.resetToken = "")) {
            return giveresponse(res, 201, false, "Link Time Expire please send again");
          }
        } else {
          return giveresponse(res, 201, false, "this password already axist. add other one");
        }
      }
      giveresponse(res, 200, true, "password reset successfully", user);
    }
  }
});

