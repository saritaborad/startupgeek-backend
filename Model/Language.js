const mongoose = require("mongoose");
const validator = require("validator");

const languageSchema = new mongoose.Schema(
    {
        userid:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        fname: {
            type: String,
        },
        lname: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: [true, "user is registered on the given email"],
            trim: true,
            validate(value) {
              if (!validator.isEmail(value)) {
                throw new Error("Please Enter Valid Email");
              }
            },
        },
        contact_no: {
            type: String,
            trim: true,
            unique: [true, "user is registered on the given contact no"],
            // validate(value){
            //     if(!validator.isMobileNumber(value))
            //     {
            //         throw new Error("Please Enter Valid Email");
            //     }
            // }
          },
        address:{
            type:String
        },
        company_name:{
            type:String
        },
        bussiness_type:{
            type:String
        },
        website_type:{
            type:String
        },
        description:{
            type:String
        }
    },
    { timestamps: true }
);


module.exports = mongoose.model("Language", languageSchema);
