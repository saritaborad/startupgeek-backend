const mongoose = require("mongoose");
const validator = require("validator");

const hireassistSchema = new mongoose.Schema(
    {
        userid:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        employment_type:{
            type:String,
        },
        work_duration:{
            type:String,
        },
        option:{
            type:String,
        },
        virtual_assistans:{
            type:String,
        },
        date:{
            type:Date,
            default:Date.now()
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
        company_website:{
            type:String
        },
        description:{
            type:String
        }
    },
    { timestamps: true }
);


module.exports = mongoose.model("Hire_Assistant", hireassistSchema);
