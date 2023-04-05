const express = require("express");
const { adminLogin, getAdminInfo, changeAdminProfile, addSubAdmin, userList, usersCompany, getAllAgent, getAgentDetail, updateAgentDetail, endContract, addAgentDetail, getCompanyName, addCompanyNames, updateCompanyName, getSingleCompanyName, deleteCompanyName, getCompanyList, getCompanyDetail, assignAgentToCompany, assignCompanyToAgent, assignAgentToService } = require("../controller/admin");
const { serviceDashboard, total_revenue } = require("../controller/dashboard");
const { getAgentName } = require("../controller/admin");
const { authorize, protect } = require("../middleware/auth");
const router = new express.Router();

//auth route
router.post("/login", adminLogin);
router.post("/getAdminDetail", protect, authorize(1), getAdminInfo);
router.post("/changeProfile", protect, authorize(1), changeAdminProfile);
router.post("/addSubAdmin", protect, authorize(1), addSubAdmin);

// agent route
router.post("/getAllAgent", protect, authorize(0, 1), getAllAgent);
router.post("/getAgentDetail", protect, authorize(0, 1), getAgentDetail);
router.post("/updateAgentDetail", protect, authorize(1), updateAgentDetail);
router.post("/getAgentName", protect, authorize(1), getAgentName);
// router.post("/assignCompany", protect, authorize(1), assignCompany);
router.post("/endContract", protect, authorize(1), endContract);
router.post("/addAgentDetail", protect, authorize(1), addAgentDetail);

// user detail route
router.post("/userList", protect, authorize(1), userList);
router.post("/usersCompany", protect, authorize(0, 1), usersCompany);

//company Name routes
router.post("/getCompanyName", protect, authorize(1), getCompanyName);
router.post("/updateCompanyName", protect, authorize(1), updateCompanyName);
router.post("/addCompanyNames", protect, authorize(1), addCompanyNames);
router.post("/deleteCompanyName", protect, authorize(1), deleteCompanyName);

//company detail API
router.post("/getCompanyList", protect, authorize(0, 1), getCompanyList);
router.post("/getCompanyDetail", protect, authorize(0, 1), getCompanyDetail);

// dashboard API
router.post("/serviceDashboard", protect, authorize(1), serviceDashboard);
router.post("/total_revenue", protect, authorize(1), total_revenue);

//Assign API
router.post("/assignToCompany", protect, authorize(1), assignAgentToCompany);
router.post("/assignCompanyToAgent", protect, authorize(1), assignCompanyToAgent);
router.post("/assignToService", protect, authorize(1), assignAgentToService);

module.exports = router;
