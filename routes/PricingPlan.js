const express = require("express");
const { getAllStates, addPricingPlan, getAllPlans, getPlansByState, updatePlan, getCompanyPlans, editServicePlan, updateDefaultPlan, getServiceTypes, getServicePlanById, deletePlan, getServiceType, addServiceType, deleteCompanyPlan } = require("../controller/pricingPlan");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

router.post("/getAllState", protect, authorize(0, 1), getAllStates);
router.post("/addPricingPlan", protect, authorize(1), addPricingPlan);
router.post("/getPricingPlan", protect, authorize(0, 1), getAllPlans);
router.post("/getPlan", protect, authorize(0, 1), getPlansByState);
router.post("/updatePlan", protect, authorize(1), updatePlan);
router.post("/updateDefaultPlan", protect, authorize(1), updateDefaultPlan);
router.post("/getServicePlanById", protect, authorize(0, 1), getServicePlanById);
router.post("/editServicePlan", protect, authorize(1), editServicePlan);
router.post("/getCompanyPlans", protect, authorize(0, 1), getCompanyPlans);
router.post("/getServiceType", protect, authorize(1), getServiceType);
router.post("/addServiceType", protect, authorize(1), addServiceType);
router.post("/deleteCompanyPlan", protect, authorize(1), deleteCompanyPlan);
router.post("/deletePlan", protect, authorize(1), deletePlan);

module.exports = router;
