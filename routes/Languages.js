const express = require("express");
const { addLanguage, updateLanguage, deleteLanguage } = require("../controller/language");
const router = new express.Router();
const {authorize, protect} = require("../middleware/auth");

router.post('/addlanguage',protect,authorize(0,1),addLanguage);
router.post('/updatelanguage',protect,authorize(0,1),updateLanguage);
router.post('/deletelanguage',protect,authorize(0,1),deleteLanguage);



module.exports = router;