const { giveresponse } = require("../helper/res_help.js");
const TaxIdNum = require("../Model/TaxidNum");
const Company = require("../Model/Company");
const asynchandler = require("../middleware/async");

// add text info
exports.addTaxId = asynchandler(async (req, res) => {
  const obj = {
    userid: req.uId,
    userPlanId: req.body.userPlanId,
    company_Id: req.body.company_Id,
    fname: req.body.fname,
    lname: req.body.lname,
    street_address: req.body.street_address,
    city: req.body.city,
    state: req.body.state,
    zip_code: req.body.zip_code,
    EIN_Type: req.body.EIN_Type,
    ein2Text: req.body.ein2Text,
    servicepay: req.body.servicepay,
  };

  const taxIddata = await TaxIdNum.findOne({ company_Id: req.body.company_Id });
  if (!taxIddata) {
    var taxId = await TaxIdNum.create(obj);
  } else {
    var taxId = await TaxIdNum.findOneAndUpdate({ company_Id: req.body.company_Id }, obj, { new: true });
  }
  giveresponse(res, 200, true, "TaxId's detail create", taxId);
});

// update data
exports.updateTaxId = asynchandler(async (req, res) => {
  const obj = {
    fname: req.body.fname,
    lname: req.body.lname,
    street_address: req.body.street_address,
    city: req.body.city,
    state: req.body.state,
    zip_code: req.body.zip_code,
    EIN_Type: req.body.EIN_Type,
    ein2Text: req.body.ein2Text,
  };
  const updateTaxid = await TaxIdNum.findOneAndUpdate({ _id: req.body._id }, obj, { new: true });

  giveresponse(res, 200, true, "TaxId's details updated", updateTaxid);
});

//  get data (single data and all data)
exports.getData = asynchandler(async (req, res) => {
  if (req.body._id != "") {
    const tax = await TaxIdNum.findOne({ _id: req.body._id, userid: req.uId });

    giveresponse(res, 200, true, "Tax data get", tax);
  } else if (req.body._id == "") {
    const { page, sizePerPage, sortObj, order, search } = req.body.option;
    var sortObject = {};
    var stype = sortObj ? sortObj : "createdAt";
    var sdir = order === "ASC" ? 1 : -1;
    sortObject[stype] = sdir;
    const startIndex = page * sizePerPage;

    const tax = await TaxIdNum.find({ userid: req.uId }).skip(startIndex).limit(sizePerPage).sort(sortObject);
    const allTax = await TaxIdNum.find({ userid: req.uId }).countDocuments();

    giveresponse(res, 200, true, "all Tax data get", { allTax, tax });
  }
});

exports.getTaxInfoByCompany = asynchandler(async (req, res) => {
  const taxinfo = await TaxIdNum.findOne({ company_Id: req.body.company_Id });
  giveresponse(res, 200, true, "Tax info get successfully!", taxinfo);
});
