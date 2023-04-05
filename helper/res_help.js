const crypto = require("crypto");
const fs = require("fs");
const algorithm = "aes-256-ctr";
const ENCRYPTION_KEY = "Put_Your_Password_Here";
const IV_LENGTH = 16;

exports.giveresponse = function (
  res,
  status_code,
  success,
  message,
  data = null
) {
  var data = data == null ? {} : data;

  var json_to_send = { success: success, message: message, data: data };

  return res.status(status_code).json(json_to_send);
};

exports.otp_genrator = function (min, max) {
  const otp = Math.floor(Math.random() * (max - min) + min);
  return otp;
};

var AWS = require("aws-sdk");
AWS.config = new AWS.Config();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

var s3 = new AWS.S3();
exports.s3_upload = function (file, file_name) {
  return new Promise((resolve, reject) => {
    const params_video = {
      Bucket: process.env.AWS_BUCKET,
      Key: `${file_name}`,
      Body: file.data,
      ContentType: file.mimetype,
    };
    s3.upload(params_video, function (error, data) {
      // console.log(error)
      if (error) {
        console.log(error);
        reject({
          status: false,
          data: error,
        });
      } else {
        //console.log(data.Location)
        resolve({
          status: true,
          data: data.Location,
        });
      }
    });
  });
};
exports.makeid = function (length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

exports.addMinutes = function (minutes) {
  var date = new Date();
  date.setDate(date.getMinutes() + minutes);
  return date.toISOString().replace(/T/, " ").replace(/\..+/, "");
};

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(
    algorithm,
    Buffer.concat([Buffer.from(ENCRYPTION_KEY), Buffer.alloc(32)], 32),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

exports.decrypt = function (text) {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.concat([Buffer.from(ENCRYPTION_KEY), Buffer.alloc(32)], 32),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

function addMinutes(minutes) {
  var date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString().replace(/T/, " ").replace(/\..+/, "");
}

exports.setMagicLink = function (user_id) {
  return new Promise((resolve, reject) => {
    var text = user_id + "/" + addMinutes(5);
    var token = encrypt(text);
    var name = "./emailpages/magic-link.html";
    var link = `http://localhost:3011/login?magic_token=${token}`;

    fs.readFile(name, { encoding: "utf-8" }, function (err, data) {
      if (err) {
        reject(err);
      } else {
        data = data.split("{{link}}").join(link);
        resolve(data);
      }
    });
  });
};
