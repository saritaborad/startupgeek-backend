const { giveresponse } = require("../helper/res_help.js");
const Member = require("../Model/Member");
const asynchandler = require("../middleware/async");

// create company
exports.addMember = asynchandler(async (req, res, next) => {
  var obj = {
    userid: req.uId,
    userPlanId: req.body.userPlanId,
    company_Id: req.body.company_Id,
    member: req.body.member,
    // member : [{
    //     fname:req.body.fname,
    //     lname:req.body.lname,
    //     street_address:req.body.street_address,
    //     address:req.body.address,
    //     city:req.body.city,
    //     state:req.body.state,
    //     zip_code:req.body.zip_code,
    //     Ownership:req.body.Ownership,
    //     companyType:req.body.companyType
    // }]
  };
  const memberData = await Member.create(obj);

  for (var i = 0; i < memberData.member.length; i++) {
    if (req.body.member[i].companyType == 1) {
      memberData.member[i].company_name = req.body.member[i].company_name;
    } else {
      memberData.member[i].company_name = null;
    }
  }
  memberData.save();
  giveresponse(res, 200, true, "member's detail create", memberData);
});

// update data
exports.memberUpdate = asynchandler(async (req, res, next) => {
  const obj = {
    "member.$.fname": req.body.fname,
    "member.$.lname": req.body.lname,
    "member.$.street_address": req.body.street_address,
    "member.$.address": req.body.address,
    "member.$.city": req.body.city,
    "member.$.state": req.body.state,
    "member.$.zip_code": req.body.zip_code,
    "member.$.Ownership": req.body.Ownership,
    "member.$.companyType": req.body.companyType,
    "member.$.company_name": req.body.company_name,
  };
  const updateMember = await Member.findOneAndUpdate({ $and: [{ _id: req.body._id }, { "member._id": req.body.memberid }] }, obj, { new: true });
  giveresponse(res, 200, true, "Member detail updated successfully!", updateMember);
});

// get member info
exports.getMember = asynchandler(async (req, res, next) => {
  const page = req.body.page || 1;
  const limit = req.body.limit || 10;
  const startIndex = (page - 1) * 10;
  if (req.body._id != "") {
    const member = await Member.findOne({ _id: req.body._id });

    giveresponse(res, 200, true, "member's details get successfully", member);
  } else if (req.body._id == "") {
    const member = await Member.find().skip(startIndex).limit(limit);

    const totalMember = await Member.find({ userid: req.uId }).countDocuments();
    const tPage = totalMember / limit;
    const totalPage = Math.ceil(tPage);
    giveresponse(res, 200, true, "All Member's details get successfully", { totalPage, totalMember, page, member });
  }
});

exports.getMemberByCompany = asynchandler(async (req, res, next) => {
  const member = await Member.findOne({ company_Id: req.body.company_Id });
  giveresponse(res, 200, true, "Member get successfully!", member);
});

exports.createMember = asynchandler(async (req, res, next) => {
  var obj = {
    userid: req.uId,
    userPlanId: req.body.userPlanId,
    company_Id: req.body.company_Id,
    member: req.body.member,
  };
  const member = await Member.findOneAndUpdate({ company_Id: req.body.company_Id }, { $set: { ...obj } }, { new: true, upsert: true });
  giveresponse(res, 200, true, "Member added successfully!", member);
});
