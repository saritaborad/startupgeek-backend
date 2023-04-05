const { giveresponse } = require("../helper/res_help");
const asyncHandler = require("../middleware/async");
const Agent = require("../Model/Agent");
const Request = require("../Model/Request");

exports.getAllRequest = asyncHandler(async (req, res, next) => {
  const { sort, order } = req.body;
  var sortObject = {};
  var stype = sort ? sort : "agentCompany.createdAt";
  var sdir = order?.toLowerCase() === "asc" ? 1 : -1;
  sortObject[stype] = sdir;

  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  if (req.body.search) {
    find = {
      $or: [
        {
          companyName: {
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
        {
          service_type: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          username: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
      ],
    };
  } else {
    find = {};
  }

  const allRequest = await Request.find(find).select("username service_type service_title companyName payment status").skip(startIndex).limit(limit).sort(sortObject);

  const totalRecord = await Request.find(find).countDocuments();
  const tpage = totalRecord / limit;
  const totalPage = Math.ceil(tpage);
  return giveresponse(res, 200, true, "All request get successfully!", { allRequest, totalPage, totalRecord, page });
});

exports.getRequestDetail = asyncHandler(async (req, res, next) => {
  const { _id } = req.body;
  const request = await Request.findById({ _id })
    .populate({
      path: "companyId",
      model: "Company",
      select: "Cname email fname lname",
    })
    .populate({
      path: "orderId",
      model: "Order",
    });

  const agentDetail = await Agent.find({ "agentService.requestId": req.body._id }).select("company_name name email street_address");

  return giveresponse(res, 200, true, "Request detail get successfully!", { request, agentDetail });
});

exports.addRequest = asyncHandler(async (req, res, next) => {
  const { userid, companyId, payment, status, orderId, serviceId, service_type, service_title, username, companyName } = req.body;

  const request = await Request({ userid, companyId, payment, status, orderId, serviceId, service_type, service_title, username, companyName });
  request.save();
  return giveresponse(res, 200, true, "Request created successfully!", request);
});

exports.updateRequest = asyncHandler(async (req, res, next) => {
  const { userid, companyId, payment, status, orderId, serviceId, service_type, service_title, username, companyName, _id } = req.body;
  const update = await Request.findByIdAndUpdate({ _id }, { $set: { userid, companyId, payment, status, orderId, serviceId, service_type, service_title, username, companyName } }, { new: true });
  return giveresponse(res, 200, true, "update", update);
});

exports.assignToAgent = asyncHandler(async (req, res, next) => {
  const { task, description, requestId } = req.body;
  const assigned = await Agent.findOneAndUpdate({ _id: req.body.agentId }, { $push: { agentService: { requestId, description, task } } }, { new: true });
  return giveresponse(res, 200, true, "Service assigned successfully!");
});

exports.changeServiceStatus = asyncHandler(async (req, res, next) => {
  const { status, _id } = req.body;
  const changed = await Request.findOneAndUpdate({ _id }, { $set: { status } }, { new: true });
  return giveresponse(res, 200, true, "Status updated successfully!");
});
