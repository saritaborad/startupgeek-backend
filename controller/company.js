const { giveresponse } = require("../helper/res_help.js");
const Company = require("../Model/Company");
const asynchandler = require("../middleware/async");
const User = require("../Model/User.js");
const UserPlan = require("../Model/UserPlan");
const Contact = require("../Model/Contact");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const Agent = require("../Model/Agent.js");
const Naics = require("../Model/NAICS_CODE");

// create company
exports.addCompany = asynchandler(async (req, res, next) => {
  const plan = await UserPlan.findOne({ _id: req.body.userPlanId });

  var obj = {
    userid: req.uId,
    userPlanId: req.body.userPlanId,
    Cname: req.body.Cname,
    designator: req.body.designator,
    company_name: `${req.body.Cname} ${req.body.designator}`,
    industry: req.body.industry,
    owners: req.body.owners,
    business_purpose: req.body.business_purpose,
    authorized_no: req.body.authorized_no,
    share_value: req.body.share_value,
    shareholders_no: req.body.shareholders_no,
    street_address: req.body.street_address,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    entity_type: req.body.entity_type,
    formation_state: req.body.formation_state,
    service_state: req.body.service_state,
    confirm_company_name: req.body.confirm_company_name,
    zip_code: req.body.zip_code,
    description: req.body.description,
    planstatus: true,
    company_type: plan.company_type,
    naicsCode: req.body.naicsCode,
    naicsSubCode: req.body.naicsSubCode,
    naicsCodes_string: req.body.naicsCodes_string,
    naicSubcodes_string: req.body.naicSubcodes_string,
    naicsfullDescription: req.body.fullDescription,
  };

  var company = await Company.find({ Cname: { $in: req.body.Cname } });
  if (company.length === 0) {
    var newData = await Company.create(obj);
    plan.company_id = newData._id;
    plan.save();
    return giveresponse(res, 200, true, "company add successfully", newData);
  } else if (company) {
    return giveresponse(res, 400, false, "company name already exist");
  }
});

// update company
exports.updateInfo = asynchandler(async (req, res, next) => {
  const obj = {
    Cname: req.body.Cname,
    designator: req.body.designator,
    company_name: `${req.body.Cname} ${req.body.designator}`,
    industry: req.body.industry,
    owners: req.body.owners,
    business_purpose: req.body.business_purpose,
    authorized_no: req.body.authorized_no,
    share_value: req.body.share_value,
    shareholders_no: req.body.shareholders_no,
    street_address: req.body.street_address,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    entity_type: req.body.entity_type,
    formation_state: req.body.formation_state,
    service_state: req.body.service_state,
    confirm_company_name: req.body.confirm_company_name,
    zip_code: req.body.zip_code,
    description: req.body.description,
    naicsCode: req.body.naicsCode,
    naicsSubCode: req.body.naicsSubCode,
    naicsCodes_string: req.body.naicsCodes_string,
    naicSubcodes_string: req.body.naicSubcodes_string,
    naicsfullDescription: req.body.fullDescription,
  };

  const infoUpdate = await Company.findByIdAndUpdate({ _id: req.body._id }, obj, { new: true });
  giveresponse(res, 200, true, "information update successfully", infoUpdate);
});

// get company
exports.getcompany = asynchandler(async (req, res, next) => {
  // const company = await Company.findOne({_id:req.body._id,userid:req.uId});
  const { _id } = req.body;
  const company = await Company.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(_id),
      },
    },
    {
      $lookup: {
        from: "userplans",
        localField: "userid",
        foreignField: "userid",
        pipeline: [
          {
            $project: {
              userid: 1,
              "plan.name": 1,
              stateName: 1,
              entity_type: 1,
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
      },
    },
    {
      $unwind: {
        path: "$plan.plan",
      },
    },
  ]);
  if (!company) return giveresponse(res, 201, "company data can not get with this id");
  giveresponse(res, 200, true, "single company information get successfully", company);
});

// get all company
exports.getCompanyGroup = asynchandler(async (req, res, next) => {
  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  const user = await User.findOne({ _id: req.uId });
  if (user.role == 1) {
    var company = await Company.find().skip(startIndex).limit(limit);
  } else if (user.role == 0) {
    var company = await Company.find({ userid: req.uId }).skip(startIndex).limit(limit);
  }

  const totalRecord = await Company.find({ userid: req.uId }).countDocuments();
  const tPage = totalRecord / limit;
  const totalPage = Math.ceil(tPage);

  giveresponse(res, 200, true, "All Company get succesfully", { totalPage, totalRecord, page, company });
});

// admin
// after login flow
// get single company all details
exports.singleCompanyAllDetails = asynchandler(async (req, res, next) => {
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
        pipeline: [{ $project: { fname: 1, lname: 1, name: 1, email: 1, address: 1, street_address: 1, city: 1, zip_code: 1, country: 1, hireAgent: 1, entity_type: 1, agentType: 1, agentStatus: 1 } }],
        as: "agent",
      },
    },
    {
      $lookup: {
        from: "directors",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [{ $project: { "director.fname": 1, "director.lname": 1, "director.address": 1, "director.city": 1, "director.street_address": 1, "director.zip_code": 1, "director.state": 1, president: 1, secretary: 1, treasurer: 1, vice_president: 1 } }],
        as: "director",
      },
    },
    {
      $lookup: {
        from: "members",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [{ $project: { "member.fname": 1, "member.lname": 1, "member.street_address": 1, "member.state": 1, "member.zip_code": 1, "member.city": 1, "member.address": 1, "member._id": 1, "member.Ownership": 1 } }],
        as: "member",
      },
    },
    {
      $lookup: {
        from: "taxid_nums",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [{ $project: { fname: 1, lname: 1, street_address: 1, city: 1, zip_code: 1, ein2Text: 1, EIN_Type: 1 } }],
        as: "tax_info",
      },
    },
    {
      $lookup: {
        from: "billings",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [{ $project: { Card_Number: 1 } }],
        as: "billing",
      },
    },
    {
      $lookup: {
        from: "contacts",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [{ $project: { address: 1, phone: 1, email: 1, fname: 1, lname: 1, street_address: 1, address: 1, city: 1, state: 1, zip_code: 1 } }],
        as: "contact",
      },
    },
  ]);

  return giveresponse(res, 200, true, "Company list get successfully", company);
});

exports.getCompanyAllDetail = asynchandler(async (req, res, next) => {
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
        pipeline: [{ $project: { fname: 1, lname: 1, name: 1, email: 1, address: 1, street_address: 1, city: 1, zip_code: 1, country: 1, hireAgent: 1, entity_type: 1, agentType: 1, agentStatus: 1, state: 1 } }],
        as: "agent",
      },
    },
    {
      $unwind: {
        path: "$agent",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "directors",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [{ $project: { "director.fname": 1, "director.lname": 1, "director.address": 1, "director.city": 1, "director.street_address": 1, "director.zip_code": 1, "director.state": 1, president: 1, secretary: 1, treasurer: 1, vice_president: 1 } }],
        as: "director",
      },
    },
    {
      $unwind: {
        path: "$director",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "members",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [{ $project: { "member.fname": 1, "member.lname": 1, "member.street_address": 1, "member.state": 1, "member.zip_code": 1, "member.city": 1, "member.address": 1, "member._id": 1, "member.Ownership": 1 } }],
        as: "member",
      },
    },
    {
      $unwind: { path: "$member", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "shareholders",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [{ $project: { "shareholders.fname": 1, "shareholders.lname": 1, "shareholders.street_address": 1, "shareholders.address": 1, "shareholders.city": 1, "shareholders.state": 1, "shareholders.zip_code": 1, "shareholders.ssn": 1, "shareholders.no_of_shares": 1 } }],
        as: "shareholder",
      },
    },
    {
      $unwind: {
        path: "$shareholder",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "taxid_nums",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [{ $project: { fname: 1, lname: 1, street_address: 1, city: 1, zip_code: 1, ein2Text: 1, EIN_Type: 1 } }],
        as: "tax_info",
      },
    },
    {
      $unwind: {
        path: "$tax_info",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "billings",
        localField: "_id",
        foreignField: "company_Id",
        pipeline: [{ $project: { Card_Number: 1 } }],
        as: "billing",
      },
    },
    {
      $unwind: {
        path: "$billing",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "contacts",
        localField: "userPlanId",
        foreignField: "userPlanId",
        pipeline: [{ $project: { address: 1, phone: 1, email: 1, fname: 1, lname: 1, street_address: 1, address: 1, city: 1, state: 1, zip_code: 1 } }],
        as: "contact",
      },
    },
    {
      $unwind: {
        path: "$contact",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  return giveresponse(res, 200, true, "Company list get successfully", company);
});

exports.companyLogin = asynchandler(async (req, res, next) => {
  const company = await Company.findById({ _id: req.body.company_id });
  if (!company) {
    return giveresponse("company not exists");
  }
  const token = await jwt.sign({ company_id: company._id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRE_IN });
  giveresponse(res, 200, true, "Company login successfull", { company, token });
});

exports.getUsersCompany = asynchandler(async (req, res, next) => {
  const company = await Company.aggregate([
    {
      $match: { userid: ObjectId(req.uId) },
    },
    {
      $lookup: {
        from: "contacts",
        localField: "userPlanId",
        foreignField: "userPlanId",
        as: "contact",
      },
    },
    {
      $unwind: {
        path: "$contact",
        preserveNullAndEmptyArrays: true,
      },
    },
    // {
    //   $lookup: {
    //     from: "users",
    //     localField: "userid",
    //     foreignField: "_id",
    //     as: "user",
    //     pipeline: [
    //       {
    //         $project: {
    //           createdAt: 1,
    //           email: 1,
    //           fname: 1,
    //           lname: 1,
    //           phone: 1,
    //           profile_img: 1,
    //         },
    //       },
    //     ],
    //   },
    // },
  ]);

  if (company.length === 0) {
    return giveresponse(res, 400, false, "No company found!");
  }
  return giveresponse(res, 200, true, "Users company get successfully!", company);
});

exports.getCompanysAgent = asynchandler(async (req, res, next) => {
  const { company_id } = req.body;
  const agent = await Agent.find({ company_Id: company_id });
  giveresponse(res, 200, true, "Agent get successfully!", agent);
});

exports.getCompanyDetail = asynchandler(async (req, res, next) => {
  let company;
  if (req.body.company_Id) {
    company = await Company.findById({ _id: req.body.company_Id });
  } else {
    company = await Company.findOne({ userPlanId: req.body.userPlanId });
  }
  giveresponse(res, 200, true, "Company detail get successfully!", company);
});

exports.getNaicsCode = asynchandler(async (req, res, next) => {
  let find = {};

  if (req.body.search) {
    find = {
      $or: [
        {
          subcode: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          description: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          fullDescription: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          naicsCodes: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          naicsCodes_string: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          naicSubcodes: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
        {
          naicSubcodes_string: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
      ],
    };
  } else {
    find = {};
  }

  const naicsCode = await Naics.find(find).limit(7).select("_id fullDescription naicsCodes naicsCodes_string naicSubcodes naicSubcodes_string");
  giveresponse(res, 200, true, "Naics code get successfully!", naicsCode);
});
