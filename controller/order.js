const { giveresponse } = require("../helper/res_help");
const asyncHandler = require("../middleware/async");
const Order = require("../Model/Order");
const Counter = require("../Model/Counter");
const Billing = require("../Model/Billing");
const UserPlan = require("../Model/UserPlan");
const { default: mongoose } = require("mongoose");

exports.getOrderList = asyncHandler(async (req, res, next) => {
  const { sort, order, search } = req.body;

  let find;
  var sortObject = {};
  var stype = sort ? sort : "createdAt";
  var sdir = order?.toLowerCase() === "asc" ? 1 : -1;
  sortObject[stype] = sdir;

  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const startIndex = (page - 1) * limit;

  if (search) {
    if (typeof search === "number") {
      find = {
        $or: [
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$order_no" },
                regex: `.*${req.body.search}.*`,
              },
            },
          },
        ],
      };
    } else {
      find = {
        $or: [
          {
            email: {
              $regex: `.*${req.body.search?.trim()}.*`,
              $options: "i",
            },
          },
        ],
      };
    }
  } else {
    find = {};
  }

  const orders = await Order.find(find).skip(startIndex).limit(limit).sort(sortObject);
  const totalRecord = await Order.find(find).countDocuments();

  const tpage = totalRecord / limit;
  totalPage = Math.ceil(tpage);

  return giveresponse(res, 200, true, "Order list get successfully!", { totalRecord, page, totalPage, orders });
});

exports.getCompanyOrder = asyncHandler(async (req, res, next) => {
  const { sort, order, company_id } = req.body;

  var sortObject = {};
  var stype = sort ? sort : "createdAt";
  var sdir = order?.toLowerCase() === "asc" ? 1 : -1;
  sortObject[stype] = sdir;

  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  const orderList = await Order.find({ company_Id: company_id }).skip(startIndex).limit(limit).sort(sortObject);
  const totalRecord = await Order.find({ company_Id: company_id }).countDocuments();

  const tpage = totalRecord / limit;
  totalPage = Math.ceil(tpage);
  return giveresponse(res, 200, true, "company order get successully!", { totalRecord, totalPage, page, orderList });
});

// user/admin
// get order details
exports.getOrderDetail = asyncHandler(async (req, res, next) => {
  // const order = await Order.findById(req.body.order_id)
  const order = await Order.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.body.order_id),
      },
    },
    {
      $project: {
        BillingId: 1,
        company_Id: 1,
        userPlanId: 1,
        order_no: 1,
        dateTime: 1,
        email: 1,
        payment_method: 1,
        total: 1,
        status: 1,
      },
    },
    {
      $lookup: {
        from: "billings",
        localField: "BillingId",
        foreignField: "_id",
        pipeline: [{ $project: { "billInfo.fname": 1, "billInfo.lname": 1, "billInfo.address": 1 } }],
        as: "billing_info",
      },
    },

    {
      $unwind: {
        path: "$billing_info",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "companies",
        localField: "company_Id",
        foreignField: "_id",
        pipeline: [{ $project: { company_name: 1 } }],
        as: "company_name",
      },
    },
    {
      $unwind: {
        path: "$company_name",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "userplans",
        localField: "userPlanId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              total: 1,
              entity_type: 1,
              "plan.name": 1,
            },
          },
        ],
        as: "product",
      },
    },

    {
      $unwind: {
        path: "$product",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);
  return giveresponse(res, 200, true, "Order detail get successfully!", order);
});
