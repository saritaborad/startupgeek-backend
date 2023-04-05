const express = require("express");
const router = new express.Router();
const { authorize, protect } = require("../middleware/auth");
const { getAgent, addAgent, agentUpdate, companyCurrentAgent } = require("../controller/Agent");

router.get("/getAgent", protect, authorize(0, 1), getAgent);
router.post("/addagent", protect, authorize(0, 1), addAgent);
router.post("/agentupdate", protect, authorize(0, 1), agentUpdate);
router.post("/companyCurrentAgent", protect, authorize(0, 1), companyCurrentAgent);

module.exports = router;
