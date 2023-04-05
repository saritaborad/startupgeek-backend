const asyncHandler = require("../middleware/async");
const newsLetter = require("../Model/NewsLetter");
const Subscribers = require("../Model/Subscriber");
const sendMail = require("../helper/mailer");
const { giveresponse, makeid, s3_upload } = require("../helper/res_help");
const Company = require("../Model/Company");
const MailBox = require("../Model/MailBox");
const User = require("../Model/User");
const { ObjectId } = require("mongodb");

// =================================================   News letter mailbox APIs ======================================================

// get all subscribers
exports.getSubscribers = asyncHandler(async (req, res, next) => {
  const { sort, order } = req.body;

  let find = {};
  var sortObject = {};
  var stype = sort ? sort : "createdAt";
  var sdir = order === "ASC" ? 1 : -1;
  sortObject[stype] = sdir;

  var status = req.body.status && req.body.status != "" ? req.body.status : { $in: [1, 2] };
  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  if (req.body.search) {
    find = {
      $and: [
        {
          email: {
            $regex: `.*${req.body.search?.trim()}.*`,
            $options: "i",
          },
        },
      ],
      status: status,
    };
  } else {
    find = { status: status };
  }

  const subscriber = await Subscribers.find(find).skip(startIndex).limit(limit).sort(sortObject);
  const totalRecord = await Subscribers.find(find).countDocuments();
  const tpage = totalRecord / limit;
  const totalpage = Math.ceil(tpage);

  return giveresponse(res, 200, true, "All subscribers get successfully!", { totalpage, page, totalRecord, subscriber });
});

// send mail to all subscribers --> 2 - subscribed / 1 - unsubscribed
exports.sendEmailToSubscriber = asyncHandler(async (req, res, next) => {
  const { subject, description } = req.body;
  const subscribers = await Subscribers.find({ status: 2 }).select("email");
  const mailList = [];
  const sentList = [];

  subscribers.length > 0 &&
    subscribers?.map((item) => {
      mailList.push(item.email);
      sentList.push(item._id);
    });

  if (subscribers.length == 0) {
    return giveresponse(res, 400, false, "No subscriber found!");
  }

  sendMail(mailList, subject, description)
    .then(async (result) => {
      const newsletter = await newsLetter.findOneAndUpdate({ subject, description }, { $set: { subject, description, sent: sentList } }, { upsert: true });
      return giveresponse(res, 200, true, "Notification has been sent successfully!");
    })
    .catch((error) => {
      return giveresponse(res, 400, false, error.message);
    });
});

// get all subscribers whom the mail has been sent
exports.getSentData = asyncHandler(async (req, res, next) => {
  const { sort, order } = req.body;

  var sortObject = {};
  var stype = sort ? sort : "createdAt";
  var sdir = order?.toLowerCase() === "asc" ? 1 : -1;
  sortObject[stype] = sdir;

  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  const sentData = await newsLetter.aggregate([
    {
      $project: {
        sent: 1,
        createdAt: 1,
        subject: 1,
        description: 1,
      },
    },
    {
      $lookup: {
        from: "subscribers",
        localField: "sent",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 0,
              email: 1,
            },
          },
        ],
        as: "sent",
      },
    },

    {
      $unwind: "$sent",
    },
    {
      $facet: {
        data: [
          {
            $skip: startIndex,
          },
          {
            $limit: limit,
          },
          {
            $sort: sortObject,
          },
        ],
        total: [{ $count: "total" }],
      },
    },
    { $unwind: "$total" },
  ]);

  const totalRecord = sentData[0]?.total?.total;
  const tpage = totalRecord / limit;
  const totalPage = Math.ceil(tpage);

  if (sentData.length == 0) {
    return giveresponse(res, 201, true, "Email sent data not found!", sentData);
  }

  return giveresponse(res, 200, true, "Email sent data get successfully!", { totalPage, totalRecord, page, sentData: sentData[0]?.data });
});

// ===================================================== Company mailbox APIs  ==================================================

// company names list to send email
exports.getCompanyNames = asyncHandler(async (req, res, next) => {
  const { search } = req.body;
  search ? search : "";
  const companies = await Company.find({ Cname: { $regex: `.*${search?.trim()}.*`, $options: "i" } })
    .populate("userid", "_id email")
    .select("_id Cname")
    .limit(10);
  return giveresponse(res, 200, true, "Company list get successfully!", companies);
});

exports.getMailbox = asyncHandler(async (req, res, next) => {
  const { order, sort, mail_type, _id } = req.body;
  let sortObject = {};
  var stype = sort ? sort : "createdAt";
  var sdir = order?.toLowerCase() == "asc" ? 1 : -1;
  sortObject[stype] = sdir;

  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  const mailBox = await MailBox.find({ mail_type, receiverId: _id }).skip(startIndex).limit(limit).sort(sortObject);
  const totalRecord = await MailBox.find({ mail_type, receiverId: _id }).countDocuments();
  const tpage = totalRecord / limit;
  const totalPage = Math.ceil(tpage);
  giveresponse(res, 200, true, "Mailbox get successfully!", { page, totalPage, totalRecord, mailBox });
});

// ===================================================== User mailbox APIs  =====================================================

// user names list to send mail
exports.getUserNames = asyncHandler(async (req, res, next) => {
  const userNames = await User.find({
    $or: [{ fname: { $regex: `.*${req.body.search?.trim()}.*`, $options: "i" } }, { lname: { $regex: `.*${req.body.search?.trim()}.*`, $options: "i" } }],
    role: 0,
  })
    .select("email fname lname")
    .limit(10);

  return giveresponse(res, 200, true, "User names get successfully!", userNames);
});

// =====================================================  mailbox common APIs  ==================================================

// send mail to company and user
exports.sendEmail = asyncHandler(async (req, res, next) => {
  const { subject, description, attach_doc, email, mail_type, receiverId } = req.body;
  let path = [];
  if (attach_doc && attach_doc.length > 0) {
    attach_doc.map((doc) => {
      path.push(doc.path);
    });
  }
  sendMail(email, subject, description, attach_doc)
    .then(async (result) => {
      const newMail = new MailBox({ subject, description, document: path, email: email, mail_type, receiverId });
      await newMail.save();
      return giveresponse(res, 200, true, "Notification has been sent successfully!");
    })
    .catch((error) => {
      return giveresponse(res, 400, false, error.message);
    });
});

// get all mail history of company and user -->  1-company 2- user
exports.getInbox = asyncHandler(async (req, res, next) => {
  const { sort, order, mail_type } = req.body;

  let sortObject = {};
  var stype = sort ? sort : "createdAt";
  var sdir = order?.toLowerCase() == "asc" ? 1 : -1;
  sortObject[stype] = sdir;

  const page = req.body.page && req.body.page != 0 ? req.body.page : 1;
  const limit = req.body.sizePerPage && req.body.sizePerPage != 0 ? req.body.sizePerPage : 10;
  const startIndex = (page - 1) * limit;

  const allMail = await MailBox.find({ mail_type }).skip(startIndex).limit(limit).sort(sortObject);
  const totalRecord = await MailBox.find({ mail_type }).countDocuments();
  const tpage = totalRecord / limit;
  const totalPage = Math.ceil(tpage);

  // if (allMail.length == 0) {
  //   return giveresponse(res, 400, false, "No mail found!", allMail);
  // }
  return giveresponse(res, 200, true, "Inbox get successfully!", { page, totalPage, totalRecord, allMail });
});
