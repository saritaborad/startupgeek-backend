const { giveresponse, makeid, s3_upload } = require("../helper/res_help");
const asyncHandler = require("../middleware/async");
const bcrypt = require("bcryptjs");
const Agent = require("../Model/Agent");
const User = require("../Model/User");
const { ObjectId } = require("mongodb");
const CompanyName = require("../Model/CompanyName");
const Document = require("../Model/Document");
const Company = require("../Model/Company");
const Business = require("../Model/Business");
const { default: mongoose } = require("mongoose");
const Assign = require("../Model/Assign");

async function assign(type, agent = "", company = "", service = "", agentid = "", companyid = "", serviceid = "") {
  let query = {};
  let query2 = {};
  let pushId = {};
  if (type === "company") {
    query.company = company;
    pushId = { $addToSet: { agentId: agentid } };
  } else if (type === "agent") {
    query.agent = agent;
    pushId = { $addToSet: { companyId: companyid } };
  } else if (type === "service") {
    query.service = service;
    pushId = { $addToSet: { agentId: agentid } };
  }

  const assign = await Assign.findOneAndUpdate(query, pushId, { upsert: true, new: true });
}

async function assignCompany(agentId, companyId, task, description) {
  obj = {
    "agentCompany.$[item].companyId": ObjectId(companyId),
    "agentCompany.$[item].task": task,
    "agentCompany.$[item].description": description,
    "agentCompany.$[item].start_date": Date.now(),
  };

  try {
    const assignedComp = await Agent.findByIdAndUpdate(
      { _id: agentId },
      { $set: { ...obj } },
      {
        arrayFilters: [
          {
            "item.companyId": { $eq: ObjectId(companyId) },
          },
        ],
        new: true,
      }
    );

    const addNew = await Agent.findOneAndUpdate({ $and: [{ _id: agentId }, { "agentCompany.companyId": { $ne: ObjectId(companyId) } }] }, { $push: { agentCompany: { companyId, task: task, description } } }, { new: true });
    // const agentToCompany = await Company.findOneAndUpdate({ $and: [{ _id: companyId }, { agent_id: { $nin: [agentId] } }] }, { $push: { agent_id: agentId } });
  } catch (error) {
    console.log(error);
  }
}

//admin user
exports.adminLogin = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email || !req.body.password) {
    return giveresponse(res, 400, false, "Please provide email and password");
  }
  const user = await User.findOne({ email, role: 1 }).select("+password");
  if (!user) {
    return giveresponse(res, 400, false, "User does not exists");
  }
  const isMatch = await user.matchPassword(req.body.password);
  if (!isMatch) {
    return giveresponse(res, 400, false, "Invalid credentials");
  }
  const token = await user.generateAuthToken();
  const { password, is_varified, is_social, google_login, facebook_login, resetToken, status, ...info } = user?._doc;
  info.token = token;
  return giveresponse(res, 200, true, "Login successfull!", info);
});

// add or update sub admin
exports.addSubAdmin = asyncHandler(async (req, res, next) => {
  const { email, fname, profile_img } = req.body;
  let user;

  const user1 = await User.findOne({ email });
  const hashPass = await bcrypt.hash(req.body.password, 8);

  if (req.body._id) {
    user = await User.findByIdAndUpdate({ _id: req.body._id }, { $set: { fname, profile_img, role: 2, password: hashPass } }, { new: true });
  } else {
    if (user1) {
      return giveresponse(res, 400, false, "User already exist with given email!");
    }

    user = new User({ email, profile_img, fname, role: 2, password: hashPass });
    await user.save();
  }

  const { password, ...info } = req.body;
  let msg = req.body?._id ? "User updated successfully!" : "User added successfully!";
  return giveresponse(res, 200, true, msg, info);
});

// get admin profile
exports.getAdminInfo = asyncHandler(async (req, res, next) => {
  const user = await User.findById({ _id: req.uId });
  const { is_varified, is_social, google_login, facebook_login, resetToken, status, ...info } = user?._doc;
  return giveresponse(res, 200, true, "User detail get successfully!", info);
});

// change admin profile
exports.changeAdminProfile = asyncHandler(async (req, res, next) => {
  const { profile_img, fname } = req.body;
  const user = await User.findById({ _id: req.uId }).select("+password");
  if (!user) {
    return giveresponse(res, 400, false, "User not found!");
  }

  const hashPass = await bcrypt.hash(req.body.password, 8);
  const newUser = await User.findByIdAndUpdate({ _id: req.uId }, { $set: { profile_img, fname, password: hashPass } }, { new: true });
  const { password, role, phone, resetToken, status, facebook_login, google_login, is_social, is_varified, ...info } = newUser?._doc;
  return giveresponse(res, 200, true, "Profile updated successfully!", info);
});

// =================================================   User Details Admin Route ======================================================

// get user list
exports.userList = asyncHandler(async (req, res, next) => {
  const { sort, order } = req.body;

  let find = {};
  var sortObject = {};
  const stype = sort ? sort : "createdAt";
  const sdir = (order && order?.toLowerCase()) == "asc" ? 1 : -1;
  sortObject[stype] = sdir;

  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  if (req.body.search) {
    find = {
      $or: [
        {
          fname: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          email: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          lname: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$fname", " ", "$lname"] },
              regex: `.*${req.body.search?.trim()}.*`,
              options: "i",
            },
          },
        },
      ],
      role: 0,
    };
  } else {
    find = { role: 0 };
  }
  const allUser = await User.find(find).populate("companyCount").select("fname lname email companyCount").skip(startIndex).limit(limit).sort(sortObject);

  const totalRecord = await User.find(find).populate("companyCount").select("fname lname email companyCount").countDocuments();
  const tpage = totalRecord / limit;
  const totalPage = Math.ceil(tpage);
  // if (allUser.length == 0) {
  //   return giveresponse(res, 400, false, "User not found");
  // }
  return giveresponse(res, 200, true, "All user get successfully!", { totalPage, totalRecord, page, allUser });
});

//  get users company
exports.usersCompany = asyncHandler(async (req, res, next) => {
  const { sort, order } = req.body;

  var sortObject = {};
  const stype = sort ? sort : "createdAt";
  const sdir = (order && order?.toLowerCase()) == "asc" ? 1 : -1;
  sortObject[stype] = sdir;

  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  const user = await User.find({ _id: req.body._id }).populate({
    path: "company",
    match: {
      $or: [{ company_name: { $regex: req.body.search?.trim(), $options: "i" } }, { entity_type: { $regex: req.body.search?.trim(), $options: "i" } }],
    },
    options: {
      skip: startIndex,
      limit: limit,
      sort: sortObject,
    },
  });
  const total = await User.find({ _id: req.body._id }).populate("company");
  const totalRecord = total[0]?.company?.length;
  const tpage = totalRecord / limit;
  const totalPage = Math.ceil(tpage);
  if (!user) {
    return giveresponse(res, 400, false, "User not found!");
  }
  return giveresponse(res, 200, true, "User's all company get successfully!", { page, totalPage, totalRecord, comapany: user[0]?.company });
});

// ================================================ Agent routes ========================================================

exports.getAllAgent = asyncHandler(async (req, res, next) => {
  const { sort, order } = req.body;
  let find;
  var sortObject = {};
  var stype = sort ? sort : "createdAt";
  var sdir = order === "ASC" ? 1 : -1;
  sortObject[stype] = sdir;

  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  if (req.body.search) {
    find = {
      $or: [
        {
          company_name: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          fname: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          email: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          lname: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
      ],
    };
  } else {
    find = {};
  }

  const agents = await Agent.find(find).skip(startIndex).limit(limit).sort(sortObject);

  const totalRecord = await Agent.find(find).countDocuments();
  const tpage = totalRecord / limit;
  const totalPage = Math.ceil(tpage);

  // if (agents.length === 0) {
  //   return giveresponse(res, 400, false, "No data found!");
  // }
  return giveresponse(res, 200, true, "Agent data get successfully!", { totalPage, totalRecord, page, agents });
});

exports.getAgentDetail = asyncHandler(async (req, res, next) => {
  const { sort, order, _id } = req.body;

  var sortObject = {};
  var stype = sort ? sort : "agentCompany.createdAt";
  var sdir = order?.toLowerCase() === "asc" ? 1 : -1;
  sortObject[stype] = sdir;

  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  const agentDetail = await Agent.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(_id),
      },
    },

    {
      $unwind: {
        path: "$agentCompany",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "companies",
        localField: "agentCompany.companyId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              Cname: 1,
              _id: 1,
            },
          },
        ],
        as: "agentCompany.companyId",
      },
    },

    { $skip: startIndex },
    { $limit: limit },
    { $sort: sortObject },

    {
      $unwind: {
        path: "$agentCompany.companyId",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $group: {
        _id: "$_id",
        agentCompany: { $push: "$agentCompany" },
        name: { $first: "$name" },
        email: { $first: "$email" },
        profile_img: { $first: "$profile_img" },
        street_address: { $first: "$street_address" },
        address: { $first: "$address" },
        city: { $first: "$city" },
        state: { $first: "$state" },
        zip_code: { $first: "$zip_code" },
        company_name: { $first: "$company_name" },
        country: { $first: "$country" },
        agentStatus: { $first: "$agentStatus" },
        hireAgent: { $first: "$hireAgent" },
        agentType: { $first: "$agentType" },
        status: { $first: "$status" },
      },
    },
  ]);

  const agent = await Agent.findById({ _id: req.body._id });

  const totalRecord = agent?.agentCompany?.length;
  const tpage = totalRecord / limit;
  const totalPage = Math.ceil(tpage);

  return giveresponse(res, 200, true, "Agent detail get successfully!", { totalPage, page, totalRecord, agentDetail });
});

exports.updateAgentDetail = asyncHandler(async (req, res, next) => {
  const { agentType, city, company_name, country, hireAgent, state, street_address, zip_code, _id, profile_img, name, email, agentStatus } = req.body;
  const updated = await Agent.findByIdAndUpdate({ _id }, { $set: { agentType, city, company_name, country, hireAgent, state, street_address, zip_code, profile_img, name, email, agentStatus, role: 1 } }, { new: true });
  return giveresponse(res, 200, true, "Agent detail updated successfully!", updated);
});

exports.endContract = asyncHandler(async (req, res, next) => {
  const { agentId, companyId } = req.body;
  try {
    const company = await Agent.findOneAndUpdate({ $and: [{ _id: agentId }, { "agentCompany.companyId": { $eq: ObjectId(companyId) } }] }, { $set: { "agentCompany.$.end_date": new Date() } }, { new: true });
    return giveresponse(res, 200, true, "Contract ended successfully!");
  } catch (error) {
    return giveresponse(res, 400, false, error.message);
  }
});

exports.addAgentDetail = asyncHandler(async (req, res, next) => {
  const { name, email, street_address, city, state, zip_code, company_name, country, hireAgent, agentType, profile_img, agentStatus } = req.body;
  const agent = await Agent({ name, email, city, street_address, state, zip_code, company_name, country, hireAgent, agentType, profile_img, agentStatus, role: 1 });
  agent.save();
  return giveresponse(res, 200, true, "Agent added successfully!", agent._doc);
});

exports.getAgentName = asyncHandler(async (req, res, next) => {
  const agent = await Agent.find({ role: 1 }).select("_id name company_name");
  return giveresponse(res, 200, true, "Agent Name get successfully!", agent);
});

// =========================================================== Company Names module ================================================
exports.addCompanyNames = asyncHandler(async (req, res, next) => {
  const { company_name, status } = req.body;

  const companyName = await CompanyName({ company_name, status });
  companyName.save();

  return giveresponse(res, 200, true, "Company Name added successfully!");
});

exports.updateCompanyName = asyncHandler(async (req, res, next) => {
  const { company_name, status, _id } = req.body;
  const updatedComp = await CompanyName.findByIdAndUpdate({ _id: _id }, { $set: { company_name, status } }, { new: true });
  return giveresponse(res, 200, true, "Company Name updated successfully!");
});

exports.getCompanyName = asyncHandler(async (req, res, next) => {
  const { sort, order } = req.body;

  var status = req.body.status && req.body.status != "" ? req.body.status : { $in: [1, 2, 3] };

  let find = {};
  var sortObject = {};
  var stype = sort ? sort : "createdAt";
  var sdir = order?.toLowerCase() === "asc" ? 1 : -1;
  sortObject[stype] = sdir;

  if (req.body.search) {
    find = {
      $or: [
        {
          company_name: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
      ],
      status,
    };
  } else {
    find = { status };
  }

  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  const companyNames = await CompanyName.find(find).skip(startIndex).limit(limit).sort(sortObject);
  const totalRecord = await CompanyName.find(find).countDocuments();
  const tpage = totalRecord / limit;
  const totalPage = Math.ceil(tpage);

  return giveresponse(res, 200, true, "Company names get successfully!", { page, totalPage, totalRecord, companyNames });
});

exports.getSingleCompanyName = asyncHandler(async (req, res, next) => {
  const { _id } = req.body;
  const getCompany = await CompanyName.findById({ _id: _id });
  return giveresponse(res, 200, true, "Single companyName get successfully!", getCompany);
});

exports.deleteCompanyName = asyncHandler(async (req, res, next) => {
  const { _id } = req.body;
  const deleteCom = await CompanyName.findByIdAndDelete({ _id: _id });
  return giveresponse(res, 200, true, "Company name deleted successfully!");
});

// =========================================================== Company Details module ================================================
exports.getCompanyList = asyncHandler(async (req, res, next) => {
  const { sort, order } = req.body;

  var sortObject = {};
  var stype = sort ? sort : "createdAt";
  var sdir = order?.toLowerCase() === "asc" ? 1 : -1;
  sortObject[stype] = sdir;

  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;
  const company = await Company.aggregate([
    {
      $lookup: {
        from: "userplans",
        localField: "userPlanId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              userid: 1,
              "plan.name": 1,
              stateName: 1,
              service_type: 1,
              total: 1,
            },
          },
        ],
        as: "plan",
      },
    },

    {
      $match: {
        $or: [{ Cname: { $regex: `.*${req.body.search?.trim()}.*`, $options: "i" } }, { "plan.stateName": { $regex: `.*${req.body.search?.trim()}.*`, $options: "i" } }, { "plan.total": { $regex: `.*${req.body.search?.trim()}.*`, $options: "i" } }, { "plan.plan.name": { $regex: `.*${req.body.search?.trim()}.*`, $options: "i" } }],
      },
    },

    {
      $unwind: {
        path: "$plan",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$plan.plan",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        Cname: { $first: "$Cname" },
        designator: { $first: "$designator" },
        entity_type: { $first: "$entity_type" },
        plan: { $first: "$plan" },
      },
    },
    {
      $facet: {
        data: [
          {
            $skip: startIndex,
          },
          {
            $limit: limit,
          },
          {
            $sort: sortObject,
          },
        ],
        total: [{ $count: "total" }],
      },
    },
    { $unwind: "$total" },
  ]);

  if (company.length == 0) {
    return giveresponse(res, 201, false, "No Company found!");
  }

  let newcompany = company?.length > 0 ? company[0]?.data : [];
  let totalRecord = company?.length > 0 ? company[0]?.total?.total : 0;
  const tpage = totalRecord / limit;
  const totalPage = Math.ceil(tpage);

  return giveresponse(res, 200, true, "Company list get successfully", { newcompany, totalRecord, totalPage, page });
});

exports.getCompanyDetail = asyncHandler(async (req, res, next) => {
  const company_id = req.body.company_id;

  const company = await Company.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(company_id),
      },
    },

    {
      $lookup: {
        from: "agents",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [
          {
            $project: {
              email: 1,
              address: 1,
              street_address: 1,
              city: 1,
              zip_code: 1,
              agentType: 1,

              country: 1,
              agentType: 1,
              hireAgent: 1,
              agentStatus: 1,
              entity_type: 1,
              _id: 1,
            },
          },
        ],
        as: "agent",
      },
    },
    {
      $lookup: {
        from: "directors",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [
          {
            $project: {
              "director.fname": 1,
              "director.lname": 1,
              "director.address": 1,
              "director._id": 1,
              "director.city": 1,
              "director.street_address": 1,
              "director.zip_code": 1,
            },
          },
        ],
        as: "director",
      },
    },
    {
      $lookup: {
        from: "members",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [
          {
            $project: {
              "member.fname": 1,
              "member.lname": 1,
              "member.address": 1,
              "member._id": 1,
              "member.city": 1,
              "member.street_address": 1,
              "member.zip_code": 1,
            },
          },
        ],
        as: "member",
      },
    },
    {
      $lookup: {
        from: "taxid_nums",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [
          {
            $project: {
              fname: 1,
              lname: 1,
              street_address: 1,
              city: 1,
              zip_code: 1,
              ein2Text: 1,
            },
          },
        ],
        as: "tax_info",
      },
    },
    {
      $lookup: {
        from: "businesses",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [
          {
            $project: {
              licenceNo: 1,
            },
          },
        ],
        as: "licence",
      },
    },
  ]);

  return giveresponse(res, 200, true, "Company detail get successfully", company);
});

exports.AddLicenceNum = asyncHandler(async (req, res, next) => {
  const { company_Id, licenceNo } = req.body;
  const licnum = await Business.findOneAndUpdate({ company_Id }, { $set: { licenceNo } }, { new: true });
  return giveresponse(res, 200, true, "Licence info added successfully!", licnum);
});

// =========================================================== Document module ================================================

exports.addDocument = asyncHandler(async (req, res, next) => {
  const { title, description, price, doc } = req.body;
  const addDoc = await Document({ title, description, price, doc });
  addDoc.save();
  return giveresponse(res, 200, true, "Document added successfully!");
});

exports.getAllDocument = asyncHandler(async (req, res, next) => {
  const { sort, order } = req.body;

  let docData = [];

  let find;
  var sortObject = {};
  var stype = sort ? sort : "createdAt";
  var sdir = order?.toLowerCase() === "asc" ? 1 : -1;
  sortObject[stype] = sdir;

  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  if (req.body.search) {
    find = { $or: [{ title: { $regex: `.*${req.body.search?.trim()}.*` } }, { description: { $regex: `.*${req.body.search?.trim()}.*` } }] };
  } else {
    find = {};
  }

  const allDoc = await Document.find(find).skip(startIndex).sort(sortObject).limit(limit);
  const totalRecord = await Document.find(find).countDocuments();
  const tpage = totalRecord / limit;
  const totalPage = Math.ceil(tpage);

  allDoc?.length > 0 &&
    allDoc?.map((item) => {
      let pdfArr = [];
      let docArr = [];
      let obj = {};
      obj.title = item.title;
      obj.description = item.description;
      obj.price = item.price;

      item?.doc?.length > 0 &&
        item?.doc?.map((subDoc) => {
          if (subDoc?.name?.split(".")?.pop() === "pdf") {
            pdfArr.push(subDoc);
          } else {
            docArr.push(subDoc);
          }
        });
      obj.pdf = pdfArr;
      obj.pdfCount = pdfArr.length;
      obj.doc = docArr;
      obj.docCount = docArr.length;
      obj._id = item._id;

      docData.push(obj);
    });

  return giveresponse(res, 200, true, "All document get successfully!", { docData, totalPage, totalRecord, page });
});

exports.editDocument = asyncHandler(async (req, res, next) => {
  const { title, description, price, doc, _id } = req.body;
  const updateDoc = await Document.findByIdAndUpdate({ _id }, { $set: { title, description, price, doc } }, { new: true });
  return giveresponse(res, 200, true, "Document updated successfully!", updateDoc);
});

// =========================================================== Assign (Request, Company and Agent) ================================================

// company detail => assign agent to company => agent id to company => find by company id and push agent id
// agent detail => agent id => assign company to agent => company id to agent => find by agentid and push company id
// service detail => service id => assign to agent => service id to agent  => find by serviceid and push agent id

exports.assignAgentToCompany = asyncHandler(async (req, res, next) => {
  const { idToFind, idToAssign, task, description } = req.body; //idToFind => companyId // idToAssign => agentId
  assign("company", "", idToFind, "", idToAssign);
  await Company.findOneAndUpdate({ _id: idToFind }, { $set: { agent_id: idToAssign, agent_Request_flag: false } }, { new: true });
  return giveresponse(res, 200, true, "Agent assigned sucessfully!");
});

exports.assignCompanyToAgent = asyncHandler(async (req, res, next) => {
  const { idToFind, idToAssign, task, description } = req.body; //idToFind => companyId // idToAssign => agentId
  assign("agent", idToFind, "", "", "", idToAssign);
  assignCompany(idToFind, idToAssign, task, description);
  return giveresponse(res, 200, true, "Company assigned successfully!");
});

exports.assignAgentToService = asyncHandler(async (req, res, next) => {
  const { idToFind, idToAssign, task, description } = req.body; //idToFind => serviceId // idToAssign => agentId
  assign("service", "", "", idToFind, idToAssign);
  await Agent.findOneAndUpdate({ _id: idToAssign }, { $push: { agentService: { requestId: idToFind, task, description } } }, { new: true });
  return giveresponse(res, 200, true, "Agent assigned successfully!");
});

