const express = require("express");
const { getAllDocument, addDocument, editDocument } = require("../controller/admin");
const router = express.Router();

router.post("/getAllDocument", getAllDocument);
router.post("/addDocument", addDocument);
router.post("/editDocument", editDocument);

module.exports = router;
