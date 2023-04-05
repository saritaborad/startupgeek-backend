const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");
const { giveresponse } = require("../helper/res_help");
const asyncHandler = require("../middleware/async");
const asynchandler = require("../middleware/async");
const PricingPlan = require("../Model/PricingPlan");
const UserPlan = require("../Model/UserPlan");

// get plan and save plan
exports.addPlan = asynchandler(async (req, res) => {
  const planData = await PricingPlan.findOne({ _id: req.body._id, "plan._id": { $eq: req.body.planid } }, { "plan.$": 1 });
  const obj = {
    userid: req.uId,
    plan: planData.plan,
    planid: req.body.planid,
    entity_type: req.body.entity_type,
    service_price: req.body.service_price,
    service_duration: req.body.service_duration,
    stateId: planData.stateId,
    stateName: req.body.stateName,
  };

  if (req.body.userplanId == "") {
    var Userdata = await UserPlan.create(obj);
    if (Userdata.total == null) {
      Userdata.total = Number(Userdata.plan[0].package_fee) + Number(Userdata.plan[0].state_fee);
      Userdata.save();
    }
  } else {
    var Userdata = await UserPlan.findOneAndUpdate({ userid: req.uId, _id: req.body.userplanId }, obj, { new: true });
  }
  giveresponse(res, 200, true, "plan add in user", Userdata);

  // if(!(req.body?.userplanId == Userdata?._id)){
  //   var Userdata = await UserPlan.create(obj);
  //   if (Userdata.total == null) {
  //     Userdata.total = Number(Userdata.plan[0].package_fee) + Number(Userdata.plan[0].state_fee);
  //     Userdata.save();
  //   }
  // } else {
  //   var Userdata = await UserPlan.findOneAndUpdate({userid:req.uId,_id:req.body.userplanId},obj,{new:true});
  // }
});

// user
// get user plan
exports.getUserPlan = asynchandler(async (req, res, next) => {
  const userplan = await UserPlan.find({ _id: req.body.userplanId, userid: req.uId });
  if (!userplan) {
    giveresponse(res, 201, false, "Userplan not found with this details");
  } else {
    giveresponse(res, 200, true, "Userplan get successfully", userplan);  
  }
});

exports.updateServices = asynchandler(async (req, res, next) => {
  const { _id, serviceId, servicebuy } = req.body;
  let query = {};
  servicebuy == 1 ? (query["$addToSet"] = { servicePurchased: serviceId }) : (query["$pull"] = { servicePurchased: serviceId });
  const userplan = await UserPlan.findByIdAndUpdate({ _id }, query, { new: true });
  giveresponse(res, 200, true, "service updated successfully!", userplan);
});

exports.getPurchasedService = asynchandler(async (req, res, next) => {
  const { _id } = req.body;

  const service = await UserPlan.aggregate([
    {
      $match: {
        _id: ObjectId(_id),
      },
    },
    {
      $project: {
        servicePurchased: 1,
      },
    },
    {
      $lookup: {
        from: "pricingplans",
        localField: "servicePurchased",
        foreignField: "_id",
        as: "services",
      },
    },
    {
      $unset: "servicePurchased",
    },
  ]);

  giveresponse(res, 200, true, "service get success", service);
});
