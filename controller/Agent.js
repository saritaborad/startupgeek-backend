const { giveresponse } = require("../helper/res_help.js");
const Agent = require("../Model/Agent");
const asynchandler = require("../middleware/async");
const userData = require("../Model/User");
const Company = require("../Model/Company");
const UserPlan = require("../Model/UserPlan");

// add agent
exports.addAgent = asynchandler(async (req, res) => {
  var obj = {
    userid: req.uId,
    userPlanId: req.body.userPlanId,
    company_Id: req.body.company_Id,
    name: req.body.name,
    email: req.body.email,
    street_address: req.body.street_address,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    zip_code: req.body.zip_code,
    agentType: req.body.agentType,
    status: 2,
    hireAgent: req.body.hireAgent,
    role: 0,
  };
  if (req.body.hireAgent == 1) {
    obj = {
      userid: req.uId,
      userPlanId: req.body.userPlanId,
      company_Id: req.body.company_Id,
      hireAgent: req.body.hireAgent,
      servicepay: req.body.servicepay,
    };
  }

  if (req.body.agentType == 2 && req.body.hireAgent == 2) {
    obj = {
      userid: req.uId,
      email: req.body.email,
      userPlanId: req.body.userPlanId,
      company_Id: req.body.company_Id,
      company_name: req.body.company_name,
      street_address: req.body.street_address,
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
      state: req.body.state,
      zip_code: req.body.zip_code,
      agentType: req.body.agentType,
      status: 2,
      hireAgent: 2,
      role: 0,
    };
  }
  const userplan = await UserPlan.findById(req.body.userPlanId);
  const servicepay = userplan.servicePay;
  const company = await Company.findById(req.body.company_Id);
  const agents = await Agent.findOne({ company_Id: req.body.company_Id });

  if (!agents) {
    var agent = await Agent.create(obj);
    req.body.hireAgent == 2 ? (company.agent_id = agent._id) : (company.agent_Request_flag = 1), (userplan.servicePay = agent.servicepay);
  } else {
    var agent = await Agent.findOneAndUpdate({ company_Id: req.body.company_Id }, obj, { new: true });
    if (agents.hireAgent == 2 && req.body.hireAgent == 1) {
      company.agent_Request_flag = 1;
      (company.agent_id = null), (userplan.servicePay = servicepay + agent.servicepay);
    } else if (agents.hireAgent == 1 && req.body.hireAgent == 2) {
      company.agent_id = agent._id;
      company.agent_Request_flag = 0;
      agent.servicepay = 0;
      userplan.servicePay = servicepay - agents.servicepay;
    }
  }
  agent.save();
  userplan.save();
  company.save();
  giveresponse(res, 200, true, "agent's detail create", agent);
});

// update data
exports.agentUpdate = asynchandler(async (req, res) => {
  if (req.body.agentType == 1 && req.body.hireAgent == 2) {
    var obj = {
      name: req.body.name,
      street_address: req.body.street_address,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip_code: req.body.zip_code,
      country: req.body.country,
      hireAgent: req.body.hireAgent,
      company_name: null,
    };
  } else if (req.body.hireAgent == 1) {
    obj = {
      hireAgent: req.body.hireAgent,
      company_name: null,
      street_address: null,
      address: null,
      city: null,
      country: null,
      state: null,
      zip_code: null,
      agentType: null,
      status: null,
    };
  } else if (req.body.agentType == 2 && req.body.hireAgent == 2) {
    obj = {
      name: null,
      company_name: req.body.company_name,
      street_address: req.body.street_address,
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
      state: req.body.state,
      zip_code: req.body.zip_code,
      agentType: req.body.agentType,
      status: "Third Party",
      hireAgent: 2,
    };
  }
  var updateAgent = await Agent.findOneAndUpdate({ _id: req.body._id }, obj, { new: true });
  if (updateAgent.hireAgent == 1) {
    updateAgent = await Agent.findOne({ _id: req.body._id }).select("-fname -lname -street_address -address -city -zip_code -company_name -country -status -agentType");
  }
  giveresponse(res, 200, true, "agent's details updated", updateAgent);
});

// get agent info
exports.getAgent = asynchandler(async (req, res) => {
  const { page, sizePerPage, sortObj, order, search } = req.body.option;

  if (req.body._id != "") {
    const agent = await Agent.findOne({ _id: req.body._id });
    giveresponse(res, 200, true, "agent's details get successfully", agent);
  } else if (req.body._id == "") {
    const user = await userData.findOne({ _id: req.uId });
    var Allagent;
    var totalAgent;

    var sortObject = {};
    var stype = sortObj ? sortObj : "createdAt";
    var sdir = order === "ASC" ? 1 : -1;
    sortObject[stype] = sdir;
    const startIndex = page * sizePerPage;

    if (user.role == 0) {
      Allagent = await Agent.find({ userid: req.uId }).skip(startIndex).limit(sizePerPage).sort(sortObject);
      totalAgent = await Agent.find({ userid: req.uId }).countDocuments();
      console.log(1);
    } else if (user.role == 1) {
      if (search == "" || sortObj != "" || (search != "" && sortObj != "") || (search != "" && sortObj == "")) {
        Allagent = await Agent.find({
          $or: [{ name: { $regex: search, $options: "i" } }, { company_name: { $regex: search, $options: "i" } }],
        })
          .skip(startIndex)
          .limit(sizePerPage)
          .sort(sortObject);

        totalAgent = await Agent.find({
          $or: [{ name: { $regex: search, $options: "i" } }, { company_name: { $regex: search, $options: "i" } }],
        }).countDocuments();
      } else {
        Allagent = await Agent.find().skip(startIndex).limit(sizePerPage).sort(sortObject);
        totalAgent = await Agent.find().countDocuments();
      }
    }
    giveresponse(res, 200, true, "All Agent's details get successfully", { totalAgent, Allagent });
  }
});

// view company
// registered agent page
// get company current agent
exports.companyCurrentAgent = asynchandler(async (req, res, next) => {
  const currentAgent = await Agent.findOne({ company_Id: req.body.company_Id }).select("state name address status hireAgent");
  if (!currentAgent) {
    return giveresponse(res, 201, false, "agent not found");
  } else {
    if (currentAgent.hireAgent == 1) {
      giveresponse(res, 200, true, "company agent get successfully", { flag: false, currentAgent }); // hire agent == 1, not show new registered agent service only allow change register agent
    } else {
      giveresponse(res, 200, true, "company agent get successfully", { flag: true, currentAgent }); // hireAgent == 2, show add new agent service & change register agent
    }
  }
});

// view company
// request register agent or change agent
exports.NewRegisteredAgent = asynchandler(async (req, res, next) => {
  const company = await Company.findById(req.body.company_Id);
  company.agent_Request_flag == 1;
  company.save();
});
