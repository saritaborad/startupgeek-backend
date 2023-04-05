const router = require("express").Router();
const { authorize, protect } = require("../middleware/auth");
const { addTaxId, updateTaxId, getData, getTaxInfoByCompany } = require("../controller/taxid_num");

router.post("/addtaxid", protect, authorize(0, 1), addTaxId);
router.post("/updatetaxid", protect, authorize(0, 1), updateTaxId);
router.post("/getTaxInfoByCompany", protect, authorize(0, 1), getTaxInfoByCompany);
router.get("/getData", protect, authorize(0, 1), getData);

module.exports = router;
