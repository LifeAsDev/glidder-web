const mongoose = require("mongoose");
let schema = new mongoose.Schema({
    active:{
        type:String,
    },
    status:{
        type:String,
    },
},{
    timestamps:true
}

);

const UserDB = mongoose.model("ome",schema);
module.exports = UserDB;