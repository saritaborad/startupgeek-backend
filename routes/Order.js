const express = require("express");
const { createOrder, getOrderList, getOrderDetail, getPlanDetail, getBillingDetail, addBill, getCompanyOrder } = require("../controller/order");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

// router.post("/createOrder", createOrder);
router.post("/getOrderList", protect, authorize(0, 1), getOrderList);
router.post("/getOrderDetail", protect, authorize(0, 1), getOrderDetail);
router.post("/getCompanyOrder", protect, authorize(0, 1), getCompanyOrder);
// router.post("/getPlanDetail", getPlanDetail);
// router.post("/getBillingDetail", getBillingDetail);
// router.post("/addBill", addBill);

module.exports = router;
