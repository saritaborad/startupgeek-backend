const express = require("express");
const router = new express.Router();
const { authorize, protect } = require("../middleware/auth");
const { addMember, memberUpdate, getMember, getMemberByCompany, createMember } = require("../controller/member");

router.get("/getMember", protect, authorize(0, 1), getMember);

router.post("/addMember", protect, authorize(0, 1), addMember);
router.post("/memberUpdate", protect, authorize(0, 1), memberUpdate);
router.post("/getMemberByCompany", protect, authorize(0, 1), getMemberByCompany);
router.post("/createMember", protect, authorize(0, 1), createMember);

module.exports = router;
