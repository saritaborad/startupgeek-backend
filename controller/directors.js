const { giveresponse } = require("../helper/res_help.js");
const Director = require("../Model/Director");
const asynchandler = require("../middleware/async");
const asyncHandler = require("../middleware/async");
const { countDocuments } = require("../Model/User.js");

// create company

exports.addDirector = asynchandler(async (req, res, next) => {
  const obj = {
    userid: req.uId,
    userPlanId: req.body.userPlanId,
    company_Id: req.body.company_Id,
    director: req.body.director,
    president: req.body.president,
    secretary: req.body.secretary,
    treasurer: req.body.treasurer,
    vice_president: req.body.vice_president,
  };
  const director = await Director.create(obj);

  giveresponse(res, 200, true, "director's detail create", director);
});

// update data
exports.directorUpdate = asynchandler(async (req, res, next) => {
  const obj = {
    director: req.body.director,
    president: req.body.president,
    secretary: req.body.secretary,
    treasurer: req.body.treasurer,
    vice_president: req.body.vice_president,
  };
  const updateDirector = await Director.findByOneAndUpdate({ _id: req.body._id }, obj, { new: true });
  giveresponse(res, 200, true, "Director's details updated", updateDirector);
});

// get all Director
exports.getDirector = asyncHandler(async (req, res) => {
  if (req.body._id == "") {
    const director = await Director.find();
    giveresponse(res, 200, true, "All Director get", director);
  } else {
    const director = await Director.findById(req.body._id);
    if (!director) {
      giveresponse(res, 201, false, "Director not found with this Id.");
    } else {
      giveresponse(res, 200, true, "Director details get Successfully.", director);
    }
  }
});

//admin
exports.updateDirector = asynchandler(async (req, res, next) => {
  const obj = {
    "director.$.fname": req.body.fname,
    "director.$.lname": req.body.lname,
    "director.$.street_address": req.body.street_address,
    "director.$.address": req.body.address,
    "director.$.city": req.body.city,
    "director.$.state": req.body.state,
    "director.$.zip_code": req.body.zip_code,
  };
  const updateDirector = await Director.findOneAndUpdate({ $and: [{ _id: req.body._id }, { "director._id": req.body.directorId }] }, obj, { new: true });
  giveresponse(res, 200, true, "Director detail updated successfully!", updateDirector);
});

exports.createDirector = asynchandler(async (req, res, next) => {
  const obj = {
    userid: req.uId,
    userPlanId: req.body.userPlanId,
    company_Id: req.body.company_Id,
    director: req.body.director,
    president: req.body.president,
    secretary: req.body.secretary,
    treasurer: req.body.treasurer,
    vice_president: req.body.vice_president,
  };
  const director = await Director.findOneAndUpdate({ company_Id: req.body.company_Id }, { $set: { ...obj } }, { new: true, upsert: true });
  giveresponse(res, 200, true, "Director added successfully!", director);
});

exports.getDirectorByCompany = asynchandler(async (req, res, next) => {
  const director = await Director.findOne({ company_Id: req.body.company_Id });
  giveresponse(res, 200, true, "Director get successfully!", director);
});
