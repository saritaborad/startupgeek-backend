const express = require("express");
const router = new express.Router();
const { authorize, protect } = require("../middleware/auth");
const { updatedata, getdata, addBusinessData, getBusinessByCompany } = require("../controller/business");
const { AddLicenceNum } = require("../controller/admin");

router.get("/getdata", protect, authorize(0, 1), getdata);

router.post("/addBusinessData", protect, authorize(0, 1), addBusinessData);
router.post("/updatedata", protect, authorize(0, 1), updatedata);
router.post("/AddLicenceNum", protect, authorize(0, 1), AddLicenceNum);
router.post("/getBusinessByCompany", protect, authorize(0, 1), getBusinessByCompany);

module.exports = router;
