const express = require("express");
const { addAssistants, updateAssistants, deleteAssistants } = require("../controller/hire_assistant");
const router = new express.Router();
const {authorize, protect} = require("../middleware/auth");

router.post('/addassistants',protect,authorize(0,1),addAssistants);
router.post('/updateassistants',protect,authorize(0,1),updateAssistants);
router.post('/deleteassistants',protect,authorize(0,1),deleteAssistants);



module.exports = router;