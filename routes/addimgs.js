const router = require("express").Router();
const {protect} = require("../middleware/auth")
const asynchandler = require("../middleware/async");
const {
  giveresponse,
  s3_upload,
  makeid
} = require("../helper/res_help.js");

router.post("/addimg",protect,asynchandler(async(req,res)=>{
    let file;
    let img = [];
    if (req.files) {
        if (Array.isArray(req.files.images)) {
            file = req.files.images;
        } else {
            file = Array(req.files.images);
        }
        //let oldlength = old.length;
        // console.log(file.length);
        for (let i = 0; i < file.length; i++) {
            //console.log("test2");
            var ext = file[i].name.split(".").pop();
            var file_name;
            var temp_id = makeid(6);
            file_name = `startupGeek/Images${req.body._id}_${temp_id}.${ext}`;
            var result = await s3_upload(file[i], file_name);
            console.log(result.data);
            img[i] = `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${result.data}`;
        }
        giveresponse(res, 200, true, "Images link ", { total: img.length, img });
    } else {
      giveresponse(res, 201, false, "files not found");
    }
  }))
  
module.exports = router