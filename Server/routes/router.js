const express = require("express");
const route = express.Router();
const controller = require("../controllers/controller")
const services = require("../services/render");

route.get("/",services.homeRoutes);
route.get("/video-chat",services.videoRoute);
route.get("/text-chat",services.textRoute);
route.get("/test",services.testRoute);
route.get("/talk",services.talkRoute);
route.post("/api/users",controller.create);
route.post("/leaving-user-update/:id",controller.leavingUserUpdate);
route.post("/new-user-update/:id",controller.newUserUpdate);
route.post("/get-remote-users",controller.remoteUserFind);
route.post("/update-on-engagement/:id",controller.updateOnEngagement);
route.post("/get-next-user",controller.getNextUser);
route.post("/update-on-next/:id",controller.updateOnNext);





module.exports = route;