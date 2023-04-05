const { giveresponse } = require("../helper/res_help.js");
const Assistants = require("../Model/HireAssest");
const asynchandler = require("../middleware/async");

// create company

exports.addAssistants = asynchandler(async (req, res, next) => {
  req.body.userid = req.uId;
  const assistants = await Assistants.create(req.body);

  giveresponse(res, 200, true, "Assistants's form create", assistants);
});

// update data
exports.updateAssistants = asynchandler(async (req, res, next) => {
  const assistants = await Assistants.findById(req.body._id);

  if (!assistants) {
    giveresponse(res, 201, false, "this details can not find");
  } else {
    const updateAssistants = await Assistants.findByIdAndUpdate(assistants._id, req.body, {
      new: true,
      runValidators: true,
    });

    giveresponse(res, 200, true, "Assistants's details updated", updateAssistants);
  }
});

// delete data
exports.deleteAssistants = asynchandler(async (req, res, next) => {
  const assistants = await Assistants.findById(req.body._id);

  if (!assistants) {
    giveresponse(res, 201, false, "data not find with this id");
  }
  await assistants.remove();

  giveresponse(res, 200, true, "Assistants's data delete successfully", {});
});
