const moment = require("moment/moment");
const { giveresponse } = require("../helper/res_help");
const asyncHandler = require("../middleware/async");
const Request = require("../Model/Request");
const Subscriber = require("../Model/Subscriber");
const Company = require("../Model/Company");
const Order = require("../Model/Order");

// exports.serviceDashboard = asyncHandler(async (req, res, next) => {
//   var d = new Date();
//   d.setDate(d.getDate() - 30);
//   var last_date = d;

//   var d2 = new Date();
//   d2.setDate(d2.getDate() + 1);
//   var today_date = d2;

//   let start_date = req.body.start_date || last_date;
//   let end_date = new Date(req.body.end_date)?.setDate(new Date(req.body.end_date)?.getDate() + 1) || today_date;

//   const service = await Request.find({ $and: [{ createdAt: { $gte: new Date(start_date), $lte: new Date(end_date) } }, { status: req.body.status }] });

//   let newSer = [];

//   service?.map((item) => newSer.push(moment(item.createdAt).format("DD-MM-YYYY")));

//   let x = [];
//   let y = [];
//   for (var i = 0; i < newSer?.length; i = i + count1) {
//     count1 = 1;

//     for (var j = i + 1; j < newSer?.length; j++) {
//       if (newSer[i] === newSer[j]) count1++;
//     }
//     x.push(newSer[i]);
//     y.push(count1);
//   }

//   const totalService = newSer.length;
//   const totalSubscriber = await Subscriber.find().countDocuments();
//   const totalCompany = await Company.find().countDocuments();
//   giveresponse(res, 200, true, "Service dashboard get successfully!", { totalService, totalSubscriber, totalCompany, x, y });
// });

exports.serviceDashboard = asyncHandler(async (req, res, next) => {
  const datas = async (status) => {
    var d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    var curr_date = d;

    const service1 = await Request.find({ createdAt: { $gte: curr_date }, status: status });
    // console.log(service1.length);
    const monthlyservice1 = [];

    for (const iterator of service1) {
      const date = iterator.createdAt;
      const month = date.toLocaleString("default", { month: "long" });
      var months1 = month;
      monthlyservice1.push(months1);
    }
    // console.log(monthlyservice1,"monthlyservice1");
    const x1 = [];
    const y1 = [];
    // var obj = []

    for (var i = 0; i < monthlyservice1.length; i = i + count1) {
      count1 = 1;
      for (var j = i + 1; j < monthlyservice1.length; j++) {
        if (monthlyservice1[i] === monthlyservice1[j]) count1++;
      }
      x1.push(monthlyservice1[i]);
      y1.push(count1);
    }
    // obj.push({x1:x1,y1:y1})
    // return obj
    return { x1: x1, y1: y1 };
  };

  const open = await datas(1);
  const resolved = await datas(5);

  const totalService = await Request.find({ status: 1 }).countDocuments();
  const totalSubscriber = await Subscriber.find().countDocuments();
  const totalCompany = await Company.find().countDocuments();
  giveresponse(res, 200, true, "Service dashboard get successfully!", {
    totalService,
    totalSubscriber,
    totalCompany,
    openx: open.x1,
    openy: open.y1,
    resolvedx: resolved.x1,
    resolvedy: resolved.y1,
  });
});

// admin
// dashboard total revenue
exports.total_revenue = asyncHandler(async (req, res, next) => {
  var d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  var curr_date = d;

  var date = new Date(),
    d1 = date.getFullYear(),
    d2 = date.getMonth();
  var firstDay = new Date(d1, d2, 1);

  const revenue_monthly = await Order.aggregate([
    {
      $match: { createdAt: { $gt: firstDay } },
    },
    {
      $group: {
        _id: null,
        Total: { $sum: "$total" },
      },
    },
  ]);
  const monthly_revenue = revenue_monthly[0].Total;

  const Trevenue = await Order.aggregate([
    {
      $group: { _id: null, Total: { $sum: "$total" } },
    },
  ]);
  const total_revenue = Trevenue[0].Total;

  const order = await Order.aggregate([
    {
      $match: {
        createdAt: { $gt: curr_date },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        Total: { $sum: "$total" },
      },
    },
    {
      $sort: { "_id.month": -1 },
    },
  ]);
  const x = [];
  const y = [];

  order.map((data) => {
    x.push(data._id.month);
    y.push(data.Total);
  });
  giveresponse(res, 200, true, "revenue get successfully", { total_revenue, monthly_revenue, x, y });
});
