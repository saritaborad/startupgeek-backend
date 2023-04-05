const { giveresponse } = require("../helper/res_help.js");
const Blog = require("../Model/Blog");
const asynchandler = require("../middleware/async");

// create company

exports.addBlog = asynchandler(async (req, res, next) => {
  req.body.userid = req.uId;
  const blog = await Blog.create(req.body);

  giveresponse(res, 200, true, "Blog create", blog);
});

// update data
exports.updateBlog = asynchandler(async (req, res, next) => {
  const blog = await Blog.findById(req.body._id);

  if (!blog) {
    giveresponse(res, 201, false, "this details can not find");
  } else {
    const updateBlog = await Blog.findByIdAndUpdate(blog._id, req.body, {
      new: true,
      runValidators: true,
    });

    giveresponse(res, 200, true, "Blog's details updated", updateBlog);
  }
});

// delete data
exports.deleteBlog = asynchandler(async (req, res, next) => {
  const blog = await Blog.findById(req.body._id);

  if (!blog) {
    giveresponse(res, 201, false, "data not find with this id");
  }
  await blog.remove();

  giveresponse(res, 200, true, "Blog's data delete successfully", {});
});

// get all blog
exports.getGroupname = asynchandler(async (req, res, next) => {
  const page = req.body.page || 1;

  const limit = req.body.limit || 10;

  const startIndex = (page - 1) * limit;

  const blogGroup = await Blog.find()

    .skip(startIndex)

    .limit(limit)

    .select("bussiness_type");

  const totalblogGroup = await Blog.find().countDocuments();

  const tPage = totalblogGroup / limit;

  const totalPage = Math.ceil(tPage);

  giveresponse(res, 200, true, "all blog group get succesfully", {
    totalPage,

    totalblogGroup,

    page,

    blogGroup,
  });
});

// search blog
exports.searchCustomer = asynchandler(async (req, res, next) => {
  const blogs = await Blog.find();

  const searchField = req.body.bussiness_type;

  const blog = blogs.filter((items) => items.bussiness_type.startsWith(searchField));

  console.log(blog);

  giveresponse(res, 200, true, "all blog get successfully", blog);
});
