const { giveresponse } = require("../helper/res_help");
const asyncHandler = require("../middleware/async");
const Subscribers = require("../Model/Subscriber");

// subscribe to newsletter -- 2 subscribe
exports.subscribe = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const subscriber = await Subscribers.findOneAndUpdate({ email }, { $set: { status: 2 } }, { new: true, upsert: true });
  return giveresponse(res, 200, true, "Thank you for subscribing!");
});

// unsubscribe to newsletter -- 1 unsubscibe
exports.unsubscribe = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const subscriber = await Subscribers.findOneAndUpdate({ email }, { $set: { status: 1 } }, { new: true });
  return giveresponse(res, 200, true, "You are unsubscribed!");
});
