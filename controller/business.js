const { giveresponse } = require("../helper/res_help.js");
const Business = require("../Model/Business");
const Company = require("../Model/Company");
const UserPlan = require("../Model/UserPlan");
const asynchandler = require("../middleware/async");

// exports.addData = asynchandler(async (req, res, next) => {
//   if (req.body.registration == 0) {
//     obj = {
//       userPlanId: req.body.userPlanId,
//       company_Id: req.body.company_Id,
//       registration: req.body.registration
//     };
//     const bussiness = await Business.create(obj);
//     giveresponse(res, 200, true, "bussiness's detail create", bussiness);
//   } else {
//     var obj = {
//       userPlanId: req.body.userPlanId,
//       company_Id: req.body.company_Id,
//       registration: req.body.registration,
//       street_address: req.body.street_address,
//       address: req.body.address,
//       city: req.body.city,
//       state: req.body.state,
//       zip_code: req.body.zip_code,
//       servicepay: req.body.servicepay
//     };
//     const bussiness = await Business.create(obj);
//     const userplan = await UserPlan.findById(req.body.userPlanId)
//     const servicepay = userplan.servicePay
//     userplan.servicePay = servicepay + bussiness.servicepay
//     // userplan.servicePay = bussiness.servicepay
//     userplan.save()
//     giveresponse(res, 200, true, "bussiness's detail create", bussiness);
//   }
// });

// create bussiness
exports.addBusinessData = asynchandler(async (req, res, next) => {
  if (req.body.registration == 1) {
    obj = {
      userPlanId: req.body.userPlanId,
      company_Id: req.body.company_Id,
      registration: req.body.registration,
    };
  }
  if (req.body.registration == 2) {
    var obj = {
      userPlanId: req.body.userPlanId,
      company_Id: req.body.company_Id,
      registration: req.body.registration,
      street_address: req.body.street_address,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip_code: req.body.zip_code,
      servicepay: req.body.servicepay,
    };
  }

  const userplan = await UserPlan.findById(req.body.userPlanId);
  const servicepay = userplan.servicePay;
  var bussinessdata = await Business.findOne({ company_Id: req.body.company_Id });

  if (!bussinessdata) {
    var bussiness = await Business.create(obj);
    if (req.body.registration == 2) {
      userplan.servicePay = servicepay + bussiness.servicepay;
    }
  } else {
    var bussiness = await Business.findOneAndUpdate({ company_Id: req.body.company_Id }, obj, { new: true });

    if (bussinessdata.registration == 1 && req.body.registration == 2) {
      userplan.servicePay = servicepay + bussiness.servicepay;
    } else if (bussinessdata.registration == 2 && req.body.registration == 1) {
      userplan.servicePay = servicepay - bussinessdata.servicepay;
      bussiness.servicepay = 0;
    }
  }
  bussiness.save();
  userplan.save();
  giveresponse(res, 200, true, "bussiness's detail create", bussiness);
});

// update data
exports.updatedata = asynchandler(async (req, res, next) => {
  var obj = {
    userid: req.uId,
    registration: req.body.registration,
    street_address: req.body.street_address,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip_code: req.body.zip_code,
  };
  if (req.body.registration == 1) {
    obj = {
      registration: req.body.registration,
      street_address: null,
      address: null,
      city: null,
      state: null,
      zip_code: null,
    };
  }
  const bussiness = await Business.findOneAndUpdate({ _id: req.body._id }, obj, { new: true });
  giveresponse(res, 200, true, "Application's details updated", bussiness);
});

// get business data
exports.getdata = asynchandler(async (req, res, next) => {
  const application = await Business.findById(req.body._id);

  if (!application) {
    giveresponse(res, 201, false, "this details can not find");
  }
  giveresponse(res, 200, true, "Application details get successfuly", application);
});

exports.getBusinessByCompany = asynchandler(async (req, res, next) => {
  const businessData = await Business.findOne({ company_Id: req.body.company_Id });
  giveresponse(res, 200, true, "license and permit data get successfully!", businessData);
});
