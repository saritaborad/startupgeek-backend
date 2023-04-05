const express = require("express");
const { getAllRequest, getRequestDetail, addRequest, updateRequest, changeServiceStatus, getAgentName, assignToAgent } = require("../controller/request");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

router.post("/getAllRequest", protect, authorize(1), getAllRequest);
router.post("/getRequestDetail", protect, authorize(1), getRequestDetail);
// router.post("/addRequest", addRequest);
router.post("/updateRequest", protect, authorize(1), updateRequest);
router.post("/changeServiceStatus", protect, authorize(1), changeServiceStatus);
router.post("/assignToAgent", protect, authorize(1), assignToAgent);

module.exports = router;
