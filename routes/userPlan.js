const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const { addPlan, getUserPlan, updateServices, getPurchasedService } = require("../controller/userPlan");

router.post("/addPlan", protect, authorize(0, 1), addPlan);
router.post("/getUserPlan", protect, authorize(0, 1), getUserPlan);
router.post("/updateServices", protect, authorize(0, 1), updateServices);
router.post("/getPurchasedService", protect, authorize(0, 1), getPurchasedService);
module.exports = router;
