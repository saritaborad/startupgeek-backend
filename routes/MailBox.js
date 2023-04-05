const express = require("express");
const router = new express.Router();
const { sendEmailToSubscriber, getSentData, getCompanyNames, getSubscribers, getUserNames, getInbox, sendEmail, getMailbox } = require("../controller/mailBox");
const { protect, authorize } = require("../middleware/auth");

// newsletter mail box routes
router.post("/getSubsribers", protect, authorize(1), getSubscribers);
router.post("/sendMail", protect, authorize(1), sendEmailToSubscriber);
router.post("/getNewsletter", protect, authorize(1), getSentData);

// company mail box
router.post("/getInbox", protect, authorize(1), getInbox);
router.post("/sendEmail", protect, authorize(1), sendEmail);
router.post("/getAllNames", protect, authorize(1), getCompanyNames);

// user mail box
router.post("/getUserNames", protect, authorize(1), getUserNames);
// router.post("/sendEmailToUser", protect, authorize(1), sendEmailToUser);

router.post("/getMailBox", protect, authorize(0, 1), getMailbox);

module.exports = router;
