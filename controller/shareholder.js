const { giveresponse } = require("../helper/res_help.js");
const Shareholder = require("../Model/Shareholder");
const asynchandler = require("../middleware/async");

// create company

exports.addShareholder = asynchandler(async (req, res, next) => {
  const obj = {
    userid: req.uId,
    userPlanId: req.body.userPlanId,
    company_Id: req.body.company_Id,
    shareholders: req.body.shareholders,
    representative_name: req.body.representative_name,
    phone: req.body.phone,
  };
  const shareholder = await Shareholder.create(obj);

  giveresponse(res, 200, true, "Shareholder's detail create", shareholder);
});

// update data
exports.shareholderUpdate = asynchandler(async (req, res, next) => {
  const obj = {
    shareholder: req.body.shareholder,
    fname: req.body.fname,
    lname: req.body.lname,
    street_address: req.body.street_address,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip_code: req.body.zip_code,
    ssn: req.body.ssn,
    no_of_shares: req.body.no_of_shares,
    phone: req.body.phone,
  };
  const updateShareholder = await Shareholder.findByOneAndUpdate({ _id: req.body._id }, obj, { new: true });

  giveresponse(res, 200, true, "Shareholder's details updated", updateShareholder);
});

// get data
exports.getshareholder = asynchandler(async (req, res, next) => {
  if (req.body._id != "") {
    const shareholder = await Shareholder.findByOne({ _id: req.body._id });

    giveresponse(res, 200, true, "Shareholder's details updated", shareholder);
  } else {
    const allshareholder = await Shareholder.findBy();

    giveresponse(res, 200, true, "All Shareholder's details updated", allshareholder);
  }
});

exports.addShareHolderData = asynchandler(async (req, res, next) => {
  const obj = {
    userid: req.uId,
    userPlanId: req.body.userPlanId,
    company_Id: req.body.company_Id,
    shareholders: req.body.shareholders,
    representative_name: req.body.representative_name,
    phone: req.body.phone,
  };
  const shareholder = await Shareholder.findOneAndUpdate({ company_Id: req.body.company_Id }, { $set: { ...obj } }, { upsert: true, new: true });
  giveresponse(res, 200, true, "Shareholder detail added!", shareholder);
});

exports.getShareHolderByCompany = asynchandler(async (req, res, next) => {
  const holder = await Shareholder.findOne({ company_Id: req.body.company_Id });
  giveresponse(res, 200, true, "Shareholder detail get successfully!", holder);
});
