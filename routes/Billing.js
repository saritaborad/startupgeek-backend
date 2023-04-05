const express = require("express");
const router = new express.Router();
const { authorize, protect } = require("../middleware/auth");
const { addBilling, updateBilling, getBilling, planPayment, getorderdetails, orderStatusWebhook, getBillInfoByCompany, addBillInfo, getUsersCard } = require("../controller/billing");

router.post("/addbill", protect, authorize(0, 1), addBilling);
router.post("/getBilling", protect, authorize(0, 1), getBilling);
router.post("/updatebill", protect, authorize(0, 1), updateBilling);
router.post("/planPayment", protect, authorize(0, 1), planPayment);
router.post("/orderStatus", orderStatusWebhook);
router.post("/getBillInfoByCompany", protect, authorize(0, 1), getBillInfoByCompany);
router.post("/addBillInfo", protect, authorize(0, 1), addBillInfo);
router.post("/getUsersCard", protect, authorize(0, 1), getUsersCard);
// router.post('/getorderdetails',protect,authorize(0,1),getorderdetails);

module.exports = router;
