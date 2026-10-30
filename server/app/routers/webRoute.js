let express = require("express");
// const { jobSeekerRoute } = require("./web/jobSeekerRoute");
const { authRoute } = require("./authRoute");
const { emailRoute } = require("./emailRoute");

let webRoute = express.Router();

webRoute.use("/auth", authRoute);
webRoute.use("/email", emailRoute);

module.exports = { webRoute };
