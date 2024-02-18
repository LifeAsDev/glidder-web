const axios = require("axios");

exports.homeRoutes = (req,res)=>{
    res.render("index");
}
exports.videoRoute = (req,res)=>{
    res.render("video_chat");
}
exports.textRoute = (req,res)=>{
    res.render("text-chat");
}

exports.testRoute = (req,res)=>{
    res.render("test");
}

exports.talkRoute = (req,res)=>{
    res.render("video-chat-new");
}