const { giveresponse } = require("../helper/res_help.js");
const Contact = require("../Model/Contact");
const asynchandler = require("../middleware/async");
const asyncHandler = require("../middleware/async");

// create contact
exports.addContact = asynchandler(async (req, res, next) => {
  const obj = {
    userid: req.uId,
    userPlanId: req.body.userPlanId,
    email: req.body.email,
    phone: req.body.phone,
    fname: req.body.fname,
    lname: req.body.lname,
    street_address: req.body.street_address,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip_code: req.body.zip_code,
  };

  const contact = await Contact.create(obj);
  giveresponse(res, 200, true, "Contact detail create", contact);
});

// update data
exports.contactUpdate = asynchandler(async (req, res, next) => {
  const obj = {
    street_address: req.body.street_address,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip_code: req.body.zip_code,
    profile_img: req.body.profile_img,
  };
  const updatecontact = await Contact.findOneAndUpdate({ _id: req.body._id }, obj, { new: true });
  giveresponse(res, 200, true, "Contact details updated", updatecontact);
});

//get contact
exports.getContact = asynchandler(async (req, res, next) => {
  const page = req.body.page || 1;
  const limit = req.body.limit || 10;
  const startIndex = (page - 1) * limit;

  if (req.body._id != "") {
    const contact = await Contact.findOne({ _id: req.body._id, userid: req.uId }); // .select('address city zip_code state');
    giveresponse(res, 200, true, "Contact get", contact);
  } else if (req.body._id == "") {
    const contact = await Contact.find({ userid: req.uId }).skip(startIndex).limit(limit);
    const totalContact = await Contact.find().countDocuments();
    const tPage = totalContact / limit;
    const totalPage = Math.ceil(tPage);
    giveresponse(res, 200, true, "All Contact get", { totalPage, totalContact, page, contact });
  }
});

exports.createContact = asynchandler(async (req, res, next) => {
  const obj = {
    userid: req.uId,
    userPlanId: req.body.userPlanId,
    company_Id: req.body.company_Id,
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    phone: req.body.phone,
    street_address: req.body.street_address,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip_code: req.body.zip_code,
  };

  const contact = await Contact.findOneAndUpdate({ company_Id: req.body.company_Id }, { $set: { ...obj } }, { upsert: true, new: true });
  giveresponse(res, 200, true, "Contact detail added!", contact);
});
