const mongoose = require("mongoose");
const validator = require("validator");

const blogSchema = new mongoose.Schema(
    {
        userid:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        bussiness_type:{
            type: String
        },
        title:{
            type: String
        },
        description:{
            type: String
        },
        name:{
            type: String
        },
        date:{
            type: Date,
            default: Date.now()
        }
    },
    { timestamps: true }
);


module.exports = mongoose.model("Blog", blogSchema);

