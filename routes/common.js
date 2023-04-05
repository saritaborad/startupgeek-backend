const router = require("express").Router();
const {protect,authorize} = require("../middleware/auth");
const { addData, getAllData } = require("../controller/common");


router.post('/addData',protect,authorize(0,1),addData);
router.post('/getAllData',protect,authorize(0,1),getAllData);

module.exports = router;