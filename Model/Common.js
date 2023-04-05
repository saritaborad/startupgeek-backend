const mongoose = require("mongoose");

const commonSchema = new mongoose.Schema({
    userid:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    userPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserPlan"
    },
    company_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    },
    servicepay: {
        type: Number
    },
    bussBanking: {
        type: Number  // 1 for intrested , 0 for not intrested
    },
    taxStrategy: {
        type: Number  // 1 for intrested, 0 for not intrested
    },
    // bussBanking:{
    //     intrested : {
    //         type: Boolean,
    //     },
    //     notInterested : {
    //         type: Boolean,
    //     }
    // },
    // taxStrategy:{
    //     intrested : {
    //         type: Boolean,
    //     },
    //     notInterested : {
    //         type: Boolean,
    //     }
    // },
})

module.exports = mongoose.model("Common",commonSchema);