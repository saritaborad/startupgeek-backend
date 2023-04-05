const { giveresponse } = require("../helper/res_help.js");
const Language = require("../Model/Language");
const asynchandler = require("../middleware/async");

// create company

exports.addLanguage = asynchandler(async (req, res, next) => {
  req.body.userid = req.uId;
  const language = await Language.create(req.body);

  giveresponse(res, 200, true, "Language's form create", language);
});

// update data
exports.updateLanguage = asynchandler(async (req, res, next) => {
  const language = await Language.findById(req.body._id);

  if (!language) {
    giveresponse(res, 201, false, "this details can not find");
  } else {
    const updateLanguage = await Language.findByIdAndUpdate(language._id, req.body, {
      new: true,
      runValidators: true,
    });

    giveresponse(res, 200, true, "language's details updated", updateLanguage);
  }
});

// delete data
exports.deleteLanguage = asynchandler(async (req, res, next) => {
  const language = await Language.findById(req.body._id);

  if (!language) {
    giveresponse(res, 201, false, "data not find with this id");
  }
  await language.remove();

  giveresponse(res, 200, true, "language's data delete successfully", {});
});
