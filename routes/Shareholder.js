const express = require("express");
const router = new express.Router();
const { authorize, protect } = require("../middleware/auth");
const { addShareholder, shareholderUpdate, addShareHolderData, getShareHolderByCompany } = require("../controller/shareholder");

router.post("/addshareholder", protect, authorize(0, 1), addShareholder);
router.post("/shareholderupdate", protect, authorize(0, 1), shareholderUpdate);
router.post("/addShareHolderData", protect, authorize(0, 1), addShareHolderData);
router.post("/getShareHolderByCompany", protect, authorize(0, 1), getShareHolderByCompany);

module.exports = router;
