const router = require("express").Router();
const { signup, login, forgotPassword, reSet, setPassword, getUserInfo, socialLogin, updateuser } = require("../controller/user");
const { protect } = require("../middleware/auth");

router.post("/socialLogin", socialLogin);
router.post("/signup", signup);
router.post("/login", login);
router.post("/getUserInfo", protect, getUserInfo);
router.post("/updateuser", protect, updateuser);
router.post("/forgotPassword", forgotPassword);
router.post("/:token", reSet);
router.post("/setPassword/:token", setPassword);

module.exports = router;
