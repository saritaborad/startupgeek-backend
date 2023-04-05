const express = require("express");
const { giveresponse } = require("../helper/res_help");
var { Country, State, City } = require("country-state-city");
const asyncHandler = require("../middleware/async");
const { protect } = require("../middleware/auth");
const router = new express.Router();

router.post(
  "/countryList",
  protect,
  asyncHandler(async (req, res, next) => {
    let arr = [];
    try {
      const countries = Country.getAllCountries();
      countries?.length > 0 &&
        countries?.map((item) => {
          let obj = {};
          obj.name = item.name;
          obj.isoCode = item.isoCode;
          obj.flag = item.flag;
          arr.push(obj);
        });
      return giveresponse(res, 200, true, "List of countries", arr);
    } catch (error) {
      return giveresponse(res, 500, false, error.message);
    }
  })
);

router.post(
  "/stateList",
  protect,
  asyncHandler(async (req, res, next) => {
    let arr = [];
    try {
      const { isoCode } = req.body;
      const states = State.getStatesOfCountry(isoCode);
      states?.length > 0 &&
        states?.map((item) => {
          let obj = {};
          obj.label = item.name;
          obj.value = item.isoCode;
          obj.countryCode = item.countryCode;
          arr.push(obj);
        });
      return giveresponse(res, 200, true, "List of state country wise", arr);
    } catch (error) {
      return giveresponse(res, 500, false, error.message);
    }
  })
);

router.post(
  "/cityList",
  protect,
  asyncHandler(async (req, res, next) => {
    let arr = [];
    try {
      const { isoCode, countryCode } = req.body;
      const cities = City.getCitiesOfState(countryCode, isoCode);
      cities?.length > 0 &&
        cities?.map((item) => {
          let obj = {};
          obj.name = item.name;
          obj.stateCode = item.stateCode;
          obj.countryCode = item.countryCode;
          arr.push(obj);
        });
      return giveresponse(res, 200, true, "List of cities state wise", arr);
    } catch (error) {
      return giveresponse(res, 500, false, error.message);
    }
  })
);

module.exports = router;
