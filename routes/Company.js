const express = require("express");
const router = new express.Router();
const { addCompany, updateInfo, getcompany, getCompanyGroup, getCompanyList, getCompanyDetail, singleCompanyAllDetails, getCompanyAllDetail, companyLogin, getUsersCompany, getCompanysAgent, getNaicsCode } = require("../controller/company");
const { protect, authorize } = require("../middleware/auth");

router.get("/getcompany", protect, authorize(0, 1), getcompany);
router.post("/getCompanyGroup", protect, authorize(0, 1), getCompanyGroup);

router.post("/addcompany", protect, authorize(0, 1), addCompany);
router.post("/infoupdate", protect, authorize(0, 1), updateInfo);
router.post("/companyLogin", protect, authorize(0, 1), companyLogin);
router.post("/getUsersCompany", protect, authorize(0, 1), getUsersCompany);
router.post("/getCompanysAgent", protect, authorize(0, 1), getCompanysAgent);
router.post("/getCompanyDetail", protect, authorize(0, 1), getCompanyDetail);
router.post("/getNaicsCode", protect, authorize(0, 1), getNaicsCode);

// admin
router.post("/singleCompanyAllDetails", protect, authorize(0, 1), singleCompanyAllDetails);
router.post("/getCompanyAllDetail", protect, authorize(0, 1), getCompanyAllDetail);

module.exports = router;
