const { giveresponse } = require("../helper/res_help.js");
const asynchandler = require("../middleware/async");
const mongoose = require("mongoose");
const Common = require("../Model/Common");
const PricingPlan = require("../Model/PricingPlan");
const Contact = require("../Model/Contact");
const Member = require("../Model/Member");
const Agent = require("../Model/Agent");
const Company = require("../Model/Company");
const TaxIdNum = require("../Model/TaxidNum");
const UserPlan = require("../Model/UserPlan");

// add data
exports.addData = asynchandler(async (req, res) => {

  const obj = {
    userPlanId: req.body.userPlanId,
    company_Id: req.body.company_Id,
    userid: req.uId,
    bussBanking: req.body.bussBanking,
    taxStrategy: req.body.taxStrategy,
    servicepay: req.body.servicepay
  };

  const taxStrategy = await Common.findOne({company_Id: req.body.company_Id})
  if(!taxStrategy){
    var data = await Common.create(obj);
  } else {
    var data = await Common.findOneAndUpdate({company_Id: req.body.company_Id}, obj, {new: true})
  }
  giveresponse(res, 200, true, "data create", data);
});

// get all data
exports.getAllData = asynchandler(async (req, res) => {
  const FormationInfo = await UserPlan.find({ company_id: req.body.company_id }).select("userid stateName entity_type");
  const ContactInfo = await Contact.find({ company_Id: req.body.company_id }).select("userid fname lname email address phone");
  var AgentInfo = await Agent.find({ company_Id: req.body.company_id });
  if (AgentInfo[0]?.hireAgent == 1) {
    AgentInfo = await Agent.find({ company_Id: req.body.company_id }).select("-fname -lname -street_address -address -city -zip_code -company_name -country -status -agentType");
  }
  var CompanyInfo = await Company.find({ _id: req.body.company_id }).select("userid company_name industry business_purpose address");
  var MemberInfo = await Member.find({ company_Id: req.body.company_id }).select("userid fname lname address street_address city state zip_code");
  giveresponse(res, 200, true, "all data get", { FormationInfo, ContactInfo, AgentInfo, CompanyInfo, MemberInfo });
});
