const express = require("express");
const router = new express.Router();
const { authorize, protect } = require("../middleware/auth");
const { getContact, addContact, contactUpdate, createContact } = require("../controller/contact");

router.post("/getContact", protect, authorize(0, 1), getContact);

router.post("/addContact", protect, authorize(0, 1), addContact);
router.post("/contactupdate", protect, authorize(0, 1), contactUpdate);
router.post("/createContact", protect, authorize(0, 1), createContact);

module.exports = router;
