const express = require("express");
const router = new express.Router();
const { giveResponse } = require("../../helper/res_help");
const User = require("../Models/User");

router.post("/:token", async(req,res)=>{

    const user = await User.findOne({
        resetToken: req.params.token
    });

    if(!user){
        giveResponse(res, 201, false, "invalid link or expired");
    }

    user.password = req.body.password
    user.resetToken = ''
    await user.save();

    giveResponse(res, 200, true, "password reset successfully");

});

module.exports = router;