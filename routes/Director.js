const express = require("express");
const router = new express.Router();
const { authorize, protect } = require("../middleware/auth");
const { addDirector, directorUpdate, getDirector, updateDirector, createDirector, getDirectorByCompany } = require("../controller/directors");

router.post("/getDirector", protect, authorize(0, 1), getDirector);
router.post("/adddirector", protect, authorize(0, 1), addDirector);
router.post("/directorupdate", protect, authorize(0, 1), directorUpdate);
router.post("/updateDirector", protect, authorize(0, 1), updateDirector);
router.post("/createDirector", protect, authorize(0, 1), createDirector);
router.post("/getDirectorByCompany", protect, authorize(0, 1), getDirectorByCompany);

module.exports = router;
