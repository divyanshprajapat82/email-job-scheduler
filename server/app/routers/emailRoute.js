const express = require("express");
const {
	scheduleEmail,
	getEmails,
	getEmailStats,
} = require("../controllers/emailController");

const emailRoute = express.Router();
const { authMiddleware } = require("../middleware/authMiddlewere");

// Add your existing authentication middleware before scheduleEmail.
emailRoute.post("/schedule", authMiddleware, scheduleEmail);
emailRoute.get("/get", authMiddleware, getEmails);
emailRoute.get("/stats", authMiddleware, getEmailStats);

module.exports = { emailRoute };
