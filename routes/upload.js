const express = require("express");
const { giveresponse, makeid, s3_upload } = require("../helper/res_help");
const asyncHandler = require("../middleware/async");
const { protect } = require("../middleware/auth");
const router = new express.Router();

// upload documents and images
router.post(
  "/document",
  protect,
  asyncHandler(async (req, res, next) => {
    let file_type = req.files?.images ? "images" : req.files?.file && "file";

    if (!req.files || (file_type == "file" ? !req.files.file : !req.files.images)) return giveresponse(res, 400, false, "please select file");
    let file = file_type == "file" ? req.files.file : req.files.images;
    let doc = [];
    let img = [];
    if (req.files) {
      if (Array.isArray(file)) {
        file = file;
      } else {
        file = Array(file);
      }

      for (let i = 0; i < file.length; i++) {
        var ext = file[i]?.name?.split(".").pop();
        var file_name;
        var temp_id = makeid(6);
        file_name = file_type == "file" ? `startupGeek/files/${temp_id}.${ext}` : file_type == "images" && `startupGeek/images/${temp_id}.${ext}`;
        var result = await s3_upload(file[i], file_name);

        if (file_type == "file") {
          let obj = {};
          obj.filename = file[i].name;
          obj.path = result.data;
          obj.contentType = file[i].mimetype;
          doc.push(obj);
        }

        if (file_type == "images") {
          img[i] = result.data;
        }
      }
      let rData = file_type == "file" ? { total: doc.length, doc } : { total: img.length, img };
      return giveresponse(res, 200, true, file_type == "file" ? "Document uploaded successfully!" : "Images uploaded successfully!", rData);
    } else {
      return giveresponse(res, 201, false, "files not found!");
    }
  })
);

module.exports = router;
