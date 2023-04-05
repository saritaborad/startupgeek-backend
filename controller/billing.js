const { giveresponse } = require("../helper/res_help.js");
const Billing = require("../Model/Billing");
const Company = require("../Model/Company");
const Userplan = require("../Model/UserPlan");
const User = require("../Model/User");
const Order = require("../Model/Order");
const Bussiness = require("../Model/Business");
const Request = require("../Model/Request");
const asynchandler = require("../middleware/async");
const Agent = require("../Model/Agent.js");
const TaxidNum = require("../Model/TaxidNum.js");
const Common = require("../Model/Common");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// after login flow
// add new card
exports.addBilling = asynchandler(async (req, res, next) => {
  req.body.userid = req.uId;
  const obj = {
    userid: req.uId,
    userPlanId: req.body.userPlanId,
    company_Id: req.body.company_Id,
    "billInfo.fname": req.body.fname,
    "billInfo.lname": req.body.lname,
    "billInfo.street_address": req.body.street_address,
    "billInfo.city": req.body.city,
    "billInfo.state": req.body.state,
    "billInfo.zip_code": req.body.zip_code,
    "billInfo.country": req.body.country,
    Card_Number: req.body.Card_Number,
    month: req.body.month,
    year: req.body.year,
    CVV: req.body.CVV,
    expiry_date: req.body.expiry_date,
  };
  const billing = await Billing.create(obj);
  giveresponse(res, 200, true, "Billing's detail create", billing);
});

// update data
exports.updateBilling = asynchandler(async (req, res, next) => {
  const billing = await Billing.findById(req.body._id);
  if (!billing) {
    giveresponse(res, 201, false, "this details can not find");
  } else {
    const obj = {
      "billInfo.fname": req.body.fname,
      "billInfo.lname": req.body.lname,
      "billInfo.street_address": req.body.street_address,
      "billInfo.city": req.body.city,
      "billInfo.state": req.body.state,
      "billInfo.zip_code": req.body.zip_code,
      "billInfo.country": req.body.country,
      Card_Number: req.body.Card_Number,
      month: req.body.month,
      year: req.body.year,
      CVV: req.body.CVV,
      expiry_date: req.body.expiry_date,
    };
    const updateBill = await Billing.findByIdAndUpdate(billing._id, obj, {
      new: true,
      runValidators: true,
    });

    giveresponse(res, 200, true, "Billing's details updated", updateBill);
  }
});

// get billing detail
exports.getBilling = asynchandler(async (req, res, next) => {
  const billing = await Billing.find({ company_Id: req.body.company_Id });
  if (billing.length === 0) {
    return giveresponse(res, 201, false, "billing info can not find with this id");
  }
  giveresponse(res, 200, true, "bill information get successfully", billing);
});

// plan payment
exports.planPayment = asynchandler(async (req, res, next) => {
  const user = await User.findById(req.uId);
  const userplan = await Userplan.findOne({ _id: req.body.userplan_id, userid: req.uId });
  const business = await Bussiness.findOne({ company_Id: req.body.company_Id });
  const company = await Company.findById(req.body.company_Id);
  const agent = await Agent.findOne({ company_Id: req.body.company_Id });
  const taxid_num = await TaxidNum.findOne({ company_Id: req.body.company_Id });
  // console.log(taxid_num,'taxid_num');
  const common = await Common.findOne({ company_Id: req.body.company_Id, taxStrategy: { $ne: null } });
  req.body.userid = req.uId;

  const billDetail = {
    userid: req.uId,
    userPlanId: req.body.userplan_id,
    company_Id: req.body.company_Id,
    "billInfo.fname": req.body.billInfo.fname,
    "billInfo.lname": req.body.billInfo.lname,
    "billInfo.street_address": req.body.billInfo.street_address,
    "billInfo.address": req.body.billInfo.address,
    "billInfo.city": req.body.billInfo.city,
    "billInfo.state": req.body.billInfo.state,
    "billInfo.zip_code": req.body.billInfo.zip_code,
    "billInfo.country": req.body.billInfo.country,
    Card_Number: req.body.Card_Number,
    month: req.body.month,
    year: req.body.year,
    CVV: req.body.CVV,
  };
  const billing = await Billing.create(billDetail);
  var randomnum = Math.floor(Math.random() * 9000000) + 1000000;
  try {
    const token = await stripe.tokens.create({
      card: {
        number: billing.Card_Number,
        exp_month: billing.month,
        exp_year: billing.year,
        cvc: billing.CVV,
        name: billing.billInfo.fname,
      },
    });
    const card = await stripe.customers.createSource(user.customer_id, { source: token.id });
    const subscription = await stripe.subscriptions.create({
      customer: user.customer_id,
      items: [{ price: userplan.plan[0].priceid }],
      default_payment_method: card.id,
      metadata: {
        name: userplan.plan[0].name,
      },
    });
    console.log(subscription.id, "subscription_id");

    const token1 = await stripe.tokens.create({
      card: {
        number: billing.Card_Number,
        exp_month: billing.month,
        exp_year: billing.year,
        cvc: billing.CVV,
        name: billing.billInfo.fname,
      },
    });
    const charge = await stripe.charges.create({
      amount: userplan.servicePay * 100,
      currency: "usd",
      description: "Service charge",
      source: token1.id,
    });
    console.log(charge.id, "charge_id");

    if (subscription && charge) {
      const order_obj = {
        userid: req.uId,
        userPlanId: req.body.userplan_id,
        company_Id: req.body.company_Id,
        BillingId: billing._id,
        order_no: randomnum,
        // service_type: "TAXES",
        // service_title: "licence and permits",
        // duration: "1 year",
        total: userplan.servicePay + Number(userplan.total),
        payment_method: billing.Card_Number,
        email: user.email,
        charge_id: charge.id,
      };
      const order = await Order.create(order_obj);
      async function data(servicepay, service_type) {
        const req_obj = {
          userid: req.uId,
          userPlanId: req.body.userplan_id,
          companyId: req.body.company_Id,
          username: user.fname + user.lname,
          companyName: company.company_name,
          orderId: order._id,
          payment: servicepay,
          service_type: service_type,
        };
        const reqObj = await Request.create(req_obj);
      }
      if (agent?.hireAgent === 1) {
        data(agent.servicepay, "AGENT");
      }
      if (taxid_num?.EIN_Type === 2) {
        data(taxid_num.servicepay, "EIN/TIN");
      }
      if (business?.registration === 1) {
        data(business.servicepay, "LICENCE");
      }
      if (common?.taxStrategy === 1) {
        data(common.servicepay, "TAXES");
      }
      data(userplan.total, "NEW");
    }
  } catch (e) {
    const order_obj = {
      userid: req.uId,
      userPlanId: req.body.userplan_id,
      company_Id: req.body.company_Id,
      BillingId: billing._id,
      order_no: randomnum,
      payment_method: billing.Card_Number,
      email: user.email,
      pyment_status: "failed",
    };
    const order = await Order.create(order_obj);
  }
  giveresponse(res, 200, true, "userplan get", userplan);
});

exports.orderStatusWebhook = asynchandler(async (req, res, next) => {
  const order = await Order.findOne({ charge_id: req.body.data.object.id });
  if (order) {
    order.pyment_status = req.body.data.object.status;
    order.save();
    giveresponse(res, 200, true, "status update successfully", order);
  } else {
    giveresponse(res, 201, false, "order not found");
  }
});

exports.getBillInfoByCompany = asynchandler(async (req, res, next) => {
  const billInfo = await Billing.findOne({ company_Id: req.body.company_Id });
  giveresponse(res, 200, true, "Bill info get successfully!", billInfo);
});

exports.addBillInfo = asynchandler(async (req, res, next) => {
  const obj = {
    userid: req.uId,
    userPlanId: req.body.userPlanId,
    company_Id: req.body.company_Id,
    "billInfo.fname": req.body.fname,
    "billInfo.lname": req.body.lname,
    "billInfo.street_address": req.body.street_address,
    "billInfo.address": req.body.address,
    "billInfo.city": req.body.city,
    "billInfo.state": req.body.state,
    "billInfo.zip_code": req.body.zip_code,
    "billInfo.country": req.body.country,
    Card_Number: req.body.Card_Number,
    month: req.body.month,
    year: req.body.year,
    CVV: req.body.CVV,
    expiry_date: req.body.expiry_date,
  };
  const billInfo = await Billing.findOneAndUpdate({ company_Id: req.body.company_Id }, { $set: { ...obj } }, { upsert: true, new: true });
  giveresponse(res, 200, true, "Billing info added successfully!", billInfo);
});

exports.getUsersCard = asynchandler(async (req, res, next) => {
  const cards = await Billing.find({ userid: req.uId });
  giveresponse(res, 200, true, "All card get successfully!", cards);
});
