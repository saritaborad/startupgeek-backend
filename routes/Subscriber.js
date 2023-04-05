const express = require("express");
const { subscribe, unsubscribe, getSubscribers } = require("../controller/subscriber");
const { protect, authorize } = require("../middleware/auth");
const router = new express.Router();

router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

module.exports = router;
