const express = require("express");
const { addBlog, updateBlog, deleteBlog, getGroupname, searchCustomer } = require("../controller/blogs");
const router = new express.Router();
const {authorize, protect} = require("../middleware/auth");

router.get('/getblog',protect,authorize(0,1),getGroupname);

router.post('/addblog',protect,authorize(0,1),addBlog);
router.post('/updateblog',protect,authorize(0,1),updateBlog);
router.post('/deleteblog',protect,authorize(0,1),deleteBlog);
router.post('/searchCustomer',protect,authorize(0,1),searchCustomer);



module.exports = router;