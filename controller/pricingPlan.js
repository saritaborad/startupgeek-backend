const { giveresponse } = require("../helper/res_help");
const asyncHandler = require("../middleware/async");
const States = require("../Model/States");
const PricingPlan = require("../Model/PricingPlan");
const Service = require("../Model/Service");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// get all states  // company plan wise all state -- pass ->isAdmin
exports.getAllStates = asyncHandler(async (req, res, next) => {
  let states = [];
  // const stateId = await PricingPlan.find().distinct("stateId");
  // const filterBy = req.body.isAdmin ? { _id: { $nin: stateId } } : {};
  const limit = req.body.search ? 10 : 0;
  var find = {};
  if (req.body.search) {
    find = {
      $and: [
        {
          name: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
          // ...filterBy,
        },
      ],
    };
  } else {
    // find = filterBy;
    find = {};
  }

  const allState = await States.find(find);
  allState?.length > 0 &&
    allState?.map((item) => {
      let obj = {};
      obj.value = item?._id;
      obj.label = item?.name;
      states.push(obj);
    });

  return giveresponse(res, 200, true, "State list get successfully", states);
});

exports.addPricingPlan = asyncHandler(async (req, res, next) => {
  const { stateId } = req.body;
  let plan;
  let existsIds = [];
  let nonExistIds = [];
  let newPlan = [];

  try {
    if (req.body.stateId && req.body.company_type && req.body.mainPlanType == 1) {
      const planExists = await PricingPlan.find({ stateId: { $in: req.body.stateId }, company_type: req.body.company_type, mainPlanType: 1 });

      planExists?.length > 0 &&
        planExists.map(async (item) => {
          existsIds.push(item.stateId?.toString());
          const stateName = await States.findOne({ _id: item.stateId }).select("-_id name");
          // console.log({ ...req.body, stateName: stateName?.name, stateId: item.stateId }, "plan exist");
          plan = await PricingPlan.findOneAndUpdate({ stateId: item.stateId?.toString(), company_type: req.body.company_type, mainPlanType: 1 }, { $set: { ...req.body, stateName: stateName?.name, stateId: item.stateId } }, { new: true });
        });
      nonExistIds = stateId?.filter((sId) => !existsIds?.some((eId) => eId === sId));

      if (nonExistIds?.length > 0) {
        nonExistIds?.map(async (nId) => {
          const stateName = await States.findOne({ _id: nId }).select("-_id name");
          for (let item of req.body?.plan) {
            const product = await stripe.products.create({
              name: item.name,
            });
            const price = await stripe.prices.create({
              unit_amount: item?.package_fee * 100,
              currency: "usd",
              recurring: { interval: "month" },
              product: product.id,
            });
            item.priceid = price.id;
            newPlan.push(item);
          }

          // console.log({ ...req.body, stateName: stateName?.name, stateId: nId }, "plan does not exist");
          plan = new PricingPlan({ ...req.body, stateName: stateName?.name, stateId: nId, plan: newPlan });

          await plan.save();
        });
      }
    } else if (req.body.mainPlanType == 3) {
      const defaultExist = await PricingPlan.findOne({ mainPlanType: 3 });
      if (defaultExist) {
        plan = await PricingPlan.findOneAndUpdate({ mainPlanType: 3 }, { $set: { ...req.body } }, { new: true });
      } else {
        for (let item of req.body?.plan) {
          const product = await stripe.products.create({
            name: item.name,
          });
          const price = await stripe.prices.create({
            unit_amount: item?.package_fee * 100,
            currency: "usd",
            recurring: { interval: "month" },
            product: product.id,
          });
          item.priceid = price.id;
          newPlan.push(item);
        }
        plan = await new PricingPlan({ ...req.body, plan: newPlan });
        await plan.save();
      }
    } else {
      const { service_type, service_title, service_price, service_duration, service_desc } = req.body;

      const product = await stripe.products.create({
        name: service_title,
      });
      const price = await stripe.prices.create({
        unit_amount: service_price * 100,
        currency: "usd",
        recurring: { interval: "month" },
        product: product.id,
      });

      plan = await PricingPlan.findOneAndUpdate({ $and: [{ service_title }, { service_type }] }, { $set: { service_type, service_title, service_price, service_duration, service_desc, priceid: price.id, mainPlanType: 2 } }, { upsert: true, new: true });
    }
  } catch (error) {
    return giveresponse(res, 500, false, error.message);
  }

  return giveresponse(res, 200, true, "Pricing plan added successfully!", plan);
});

exports.getAllPlans = asyncHandler(async (req, res, next) => {
  const { sort, order, mainPlanType } = req.body;

  var sortObject = {};
  var stype = sort ? sort : "createdAt";
  var sdir = order === "ASC" ? 1 : -1;
  sortObject[stype] = sdir;

  const page = req.body.page && req.body.page !== 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  let find = {};
  if (req.body.search) {
    find = {
      $or: [
        {
          service_type: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          service_title: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
      ],
      mainPlanType: mainPlanType,
    };
  } else {
    find = { mainPlanType: mainPlanType };
  }

  let filter = {};
  if (req.body.filter) {
    filter = {
      $or: [
        {
          service_title: {
            $regex: `.*${req.body.filter}.*`,
            $options: "i",
          },
        },
      ],
    };
  } else {
    filter = {};
  }

  const pricingPlan = await PricingPlan.find({ ...find, ...filter })
    .skip(startIndex)
    .limit(limit)
    .sort(sortObject);
  const totalRecord = await PricingPlan.find(find).countDocuments();
  const tpage = totalRecord / limit;
  const totalpage = Math.ceil(tpage);

  // if (pricingPlan.length == 0) {
  //   return giveresponse(res, 400, false, "No plan found!");
  // }
  return giveresponse(res, 200, true, "plans get successfully!", { totalpage, page, totalRecord, pricingPlan });
});

// get state and company wise pricing plan
exports.getPlansByState = asyncHandler(async (req, res, next) => {
  let plan;
  const { stateId, company_type } = req.body;

  plan = await PricingPlan.find({ stateId, company_type });
  if (plan.length == 0) {
    plan = await PricingPlan.find({ mainPlanType: 3 });
  }
  return giveresponse(res, 200, true, "Plan get successfully!", plan);
});

//get state wise plan of
exports.getCompanyPlans = asyncHandler(async (req, res, next) => {
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const startIndex = (page - 1) * limit;

  const plans = await PricingPlan.aggregate([
    {
      $match: {
        stateId: {
          $exists: true,
          $ne: null,
        },
      },
    },
    {
      $group: {
        _id: "$stateId",
        stateName: { $first: "$stateName" },
        status: { $first: "$status" },
        companyPlan: {
          $push: { plan: "$plan", company_type: "$company_type" },
        },
      },
    },
    { $skip: startIndex },
    { $limit: limit },
  ]);
  if (plans?.length == 0) {
    return giveresponse(res, 400, false, "No plan found!");
  }

  const tpage = plans?.length / limit;
  const totalPage = Math.ceil(tpage);
  const totalRecord = plans?.length;
  return giveresponse(res, 200, true, "plan get sucessfully!", { page, totalPage, totalRecord, plans });
});

// update default or company plan ---> gold, silver or platinum
exports.updatePlan = asyncHandler(async (req, res, next) => {
  const { mainPlanType, stateId, company_type } = req.body;
  const filterBy = mainPlanType == 1 ? { stateId, company_type, mainPlanType } : mainPlanType == 3 && { mainPlanType };

  let obj = {
    "plan.$[item].plan_type": req.body.plan_type, // plan type like gold, silver ...
    "plan.$[item].name": req.body.name,
    "plan.$[item].description": req.body.description,
    "plan.$[item].status": req.body.status,
    "plan.$[item].package_fee": req.body.package_fee,
    "plan.$[item].state_fee": req.body.state_fee,
    "plan.$[item].popular": req.body.popular,
    "plan.$[item].features": req.body.features,
  };
  const plan = await PricingPlan.findOneAndUpdate(
    filterBy,
    { $set: { ...obj } },
    {
      arrayFilters: [
        {
          "item._id": {
            $eq: req.body.planId, //_id of plan like gold, silver ...
          },
        },
      ],
      multi: true,
      new: true,
    }
  );

  return giveresponse(res, 200, true, "Plan updated successfully!", plan);
});

//  update default plan
exports.updateDefaultPlan = asyncHandler(async (req, res, next) => {
  let obj;
  let updatedPlan;

  if (req.body?.plan) {
    const { plan } = req.body;
    if (plan?.length > 0) {
      plan?.map(async (item) => {
        obj = {
          "plan.$[item].plan_type": item.plan_type, // plan type like gold, silver ...
          "plan.$[item].name": item.name,
          "plan.$[item].description": item.description,
          "plan.$[item].status": item.status,
          "plan.$[item].package_fee": item.package_fee,
          "plan.$[item].state_fee": item.state_fee,
          "plan.$[item].popular": item.popular,
          "plan.$[item].features": item.features,
        };

        try {
          updatedPlan = await PricingPlan.findOneAndUpdate(
            { mainPlanType: 3 },
            { $set: { ...obj } },
            {
              arrayFilters: [
                {
                  "item._id": {
                    $eq: item.planId, //_id of plan like gold, silver ...
                  },
                },
              ],
              multi: true,
              new: true,
            }
          );
        } catch (error) {
          return new ErrorResponse(error.message, 400);
        }
      });
    }
  } else {
    return giveresponse(res, 400, false, "Please give plan data to update!");
  }

  return giveresponse(res, 200, true, "Plan updated successfully!");
});

exports.getServicePlanById = asyncHandler(async (req, res, next) => {
  const { _id } = req.body;
  const servicePlan = await PricingPlan.findById({ _id: _id });
  return giveresponse(res, 200, true, "service plan get successfully!", servicePlan);
});

// update service plan
exports.editServicePlan = asyncHandler(async (req, res, next) => {
  const { service_type, service_price, service_duration, service_title, service_desc } = req.body;
  const product = await stripe.products.create({
    name: service_title,
  });
  const price = await stripe.prices.create({
    unit_amount: service_price * 100,
    currency: "usd",
    recurring: { interval: "month" },
    product: product.id,
  });
  const servicePlan = await PricingPlan.findByIdAndUpdate({ _id: req.body._id }, { $set: { service_type, service_price, service_duration, service_title, service_desc, priceid: price.id } }, { new: true });
  return giveresponse(res, 200, true, "Plan updated successully!", servicePlan);
});

// delete plan
exports.deletePlan = asyncHandler(async (req, res, next) => {
  await PricingPlan.findByIdAndDelete({ _id: req.body._id });
  return giveresponse(res, 200, true, "Plan deleted successfully!");
});

exports.getServiceType = asyncHandler(async (req, res, next) => {
  const service = await Service.find();
  return giveresponse(res, 200, true, "All service get successfully!", service);
});

exports.addServiceType = asyncHandler(async (req, res, next) => {
  const { service_type } = req.body;
  const isExist = await Service.findOne({ service_type });
  if (isExist) {
    return giveresponse(res, 400, false, "Service already exists!");
  }

  const service = await Service({ service_type });
  service.save();
  return giveresponse(res, 200, true, "Service type added successfully!", service);
});

exports.deleteCompanyPlan = asyncHandler(async (req, res, next) => {
  const { stateId } = req.body;
  try {
    await PricingPlan.findOneAndDelete({ stateId, mainPlanType: "1" });
    return giveresponse(res, 200, true, "Company plan deleted successfully!");
  } catch (error) {
    return giveresponse(res, 400, false, error.message);
  }
});
