const { emailModel } = require("../models/EmailModel");
const emailQueue = require("../queues/emailQueue");
const mongoose = require("mongoose");
const { UserModel } = require("../models/UserModel");
const { getEmailTransporter } = require("../config/emailTransporter");
const {
	reserveEmailSlot,
	releaseEmailSlot,
} = require("../utils/emailRateLimiter");

// const scheduleEmail = async (req, res) => {
// 	try {
// 		const { recipient, subject, body, scheduledAt } = req.body;

// 		// Validate required fields
// 		if (!recipient || !subject || !body || !scheduledAt) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Recipient, subject, body and scheduledAt are required",
// 			});
// 		}

// 		const scheduleDate = new Date(scheduledAt);

// 		if (Number.isNaN(scheduleDate.getTime())) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Invalid scheduled date",
// 			});
// 		}

// 		if (scheduleDate <= new Date()) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Scheduled time must be in the future",
// 			});
// 		}

// 		// Replace this with the authenticated user's ID.
// 		// Do not trust a userId supplied by the request body.
// 		const userId = req.user?.userId;

// 		if (!userId) {
// 			return res.status(401).json({
// 				success: false,
// 				message: "Authentication required",
// 			});
// 		}

// 		const recipientUser = await UserModel.findOne({
// 			email: recipient,
// 		});

// 		// Save email in MongoDB
// 		const email = await emailModel.create({
// 			// userId: String(userId),
// 			// userId: userId,
// 			userId: new mongoose.Types.ObjectId(userId),
// 			recipient,
// 			recipientName: recipientUser?.name || recipient,
// 			subject,
// 			body,
// 			scheduledAt: scheduleDate,
// 			status: "SCHEDULED",
// 		});

// 		try {
// 			// Add the job to BullMQ
// 			const job = await emailQueue.add(
// 				"send-email",
// 				{ emailId: email._id.toString() },
// 				{
// 					delay: Math.max(0, scheduleDate.getTime() - Date.now()),
// 					jobId: email._id.toString(),
// 					attempts: 3,
// 					backoff: {
// 						type: "exponential",
// 						delay: 2000,
// 					},
// 					removeOnComplete: false,
// 					removeOnFail: false,
// 				},
// 			);

// 			email.bullJobId = String(job.id);
// 			await email.save();

// 			return res.status(201).json({
// 				success: true,
// 				message: "Email scheduled successfully",
// 				data: email,
// 			});
// 		} catch (queueError) {
// 			// Avoid leaving an apparently scheduled email without a queue job.
// 			await emailModel.findByIdAndUpdate(email._id, {
// 				status: "FAILED",
// 				// errorMessage: "Unable to add email to the queue",
// 				errorMessage: queueError.message,
// 			});

// 			throw queueError;
// 		}
// 	} catch (error) {
// 		console.error("Schedule email error:", error);

// 		return res.status(500).json({
// 			success: false,
// 			message: "Failed to schedule email",
// 		});
// 	}
// };

// const scheduleEmail = async (req, res) => {
// 	try {
// 		const {
// 			recipient,
// 			subject,
// 			body,
// 			scheduledAt,
// 			senderId = "sender-1",
// 		} = req.body;

// 		// Validate required fields
// 		if (!recipient || !subject || !body || !scheduledAt) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Recipient, subject, body and scheduledAt are required",
// 			});
// 		}

// 		// Validate sender
// 		const sender = getEmailTransporter(senderId);

// 		if (!sender || !sender.email || !sender.transporter) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Invalid or unavailable email sender",
// 			});
// 		}

// 		const scheduleDate = new Date(scheduledAt);

// 		if (Number.isNaN(scheduleDate.getTime())) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Invalid scheduled date",
// 			});
// 		}

// 		if (scheduleDate <= new Date()) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Scheduled time must be in the future",
// 			});
// 		}

// 		const userId = req.user?.userId;

// 		if (!userId) {
// 			return res.status(401).json({
// 				success: false,
// 				message: "Authentication required",
// 			});
// 		}

// 		const recipientUser = await UserModel.findOne({
// 			email: recipient,
// 		});

// 		// Save email in MongoDB
// 		const email = await emailModel.create({
// 			userId: new mongoose.Types.ObjectId(userId),
// 			recipient,
// 			recipientName: recipientUser?.name || recipient,
// 			subject,
// 			body,
// 			scheduledAt: scheduleDate,
// 			senderId: sender.id,
// 			senderEmail: sender.email,
// 			status: "SCHEDULED",
// 		});

// 		try {
// 			const job = await emailQueue.add(
// 				"send-email",
// 				{
// 					emailId: email._id.toString(),
// 				},
// 				{
// 					delay: Math.max(0, scheduleDate.getTime() - Date.now()),
// 					jobId: email._id.toString(),
// 					attempts: 3,
// 					backoff: {
// 						type: "exponential",
// 						delay: 2000,
// 					},
// 					removeOnComplete: false,
// 					removeOnFail: false,
// 				},
// 			);

// 			email.bullJobId = String(job.id);
// 			await email.save();

// 			return res.status(201).json({
// 				success: true,
// 				message: "Email scheduled successfully",
// 				data: email,
// 			});
// 		} catch (queueError) {
// 			await emailModel.findByIdAndUpdate(email._id, {
// 				status: "FAILED",
// 				errorMessage: queueError.message,
// 			});

// 			throw queueError;
// 		}
// 	} catch (error) {
// 		console.error("Schedule email error:", error);

// 		return res.status(500).json({
// 			success: false,
// 			message: "Failed to schedule email",
// 		});
// 	}
// };

const scheduleEmail = async (req, res) => {
	let email = null;
	let reservedSlot = false;

	const userId = req.user?.userId;

	try {
		const {
			recipient,
			subject,
			body,
			scheduledAt,
			senderId = "sender-1",
			delay = 0,
			hourlyLimit = 0,
		} = req.body;

		if (!recipient || !subject || !body || !scheduledAt) {
			return res.status(400).json({
				success: false,
				message: "Recipient, subject, body and scheduledAt are required",
			});
		}

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		const scheduleDate = new Date(scheduledAt);

		if (Number.isNaN(scheduleDate.getTime()) || scheduleDate <= new Date()) {
			return res.status(400).json({
				success: false,
				message: "Please provide a valid future scheduled date",
			});
		}

		if (
			!Number.isInteger(delay) ||
			delay < 0 ||
			!Number.isInteger(hourlyLimit) ||
			hourlyLimit < 0
		) {
			return res.status(400).json({
				success: false,
				message: "Invalid delay or hourly limit",
			});
		}

		const sender = getEmailTransporter(senderId);

		if (!sender || !sender.email || !sender.transporter) {
			return res.status(400).json({
				success: false,
				message: "Invalid or unavailable email sender",
			});
		}

		const recipientUser = await UserModel.findOne({
			email: recipient,
		});

		email = await emailModel.create({
			userId: new mongoose.Types.ObjectId(userId),
			recipient,
			recipientName: recipientUser?.name || recipient,
			subject,
			body,
			scheduledAt: scheduleDate,
			senderId: sender.id,
			senderEmail: sender.email,
			status: "SCHEDULED",
		});

		// Reserve a unique delivery time in Redis
		const reservedTimestamp = await reserveEmailSlot({
			userId: userId.toString(),
			senderId: sender.id,
			requestedAt: scheduleDate.getTime(),
			delaySeconds: delay,
			hourlyLimit,
			emailId: email._id.toString(),
		});

		console.log("========== EMAIL SCHEDULING ==========");

		console.log("Requested timestamp:", scheduleDate.getTime());

		console.log(
			"Requested IST:",
			scheduleDate.toLocaleString("en-IN", {
				timeZone: "Asia/Kolkata",
			}),
		);

		console.log("Reserved timestamp:", reservedTimestamp);

		console.log(
			"Reserved IST:",
			new Date(reservedTimestamp).toLocaleString("en-IN", {
				timeZone: "Asia/Kolkata",
			}),
		);

		console.log(
			"Difference in minutes:",
			(reservedTimestamp - scheduleDate.getTime()) / 60000,
		);

		console.log("======================================");

		// console.log(
		// 	"Redis reserved time:",
		// 	new Date(reservedTimestamp).toISOString(),
		// );
		// console.log(
		// 	"Final IST time:",
		// 	new Date(reservedTimestamp).toLocaleString("en-IN", {
		// 		timeZone: "Asia/Kolkata",
		// 	}),
		// );

		reservedSlot = true;

		const finalScheduledAt = new Date(reservedTimestamp);

		email.scheduledAt = finalScheduledAt;

		await email.save();

		// Schedule the BullMQ job
		const job = await emailQueue.add(
			"send-email",
			{
				emailId: email._id.toString(),
			},
			{
				delay: Math.max(0, reservedTimestamp - Date.now()),
				jobId: email._id.toString(),
				attempts: 3,
				backoff: {
					type: "exponential",
					delay: 2000,
				},
				removeOnComplete: false,
				removeOnFail: false,
			},
		);

		email.bullJobId = String(job.id);
		await email.save();

		return res.status(201).json({
			success: true,
			message: "Email scheduled successfully",
			data: email,
		});
	} catch (error) {
		console.error("Schedule email error:", error);

		if (reservedSlot && email) {
			try {
				await releaseEmailSlot({
					userId: userId.toString(),
					senderId: email.senderId,
					emailId: email._id.toString(),
				});
			} catch (redisError) {
				console.error("Redis reservation cleanup error:", redisError.message);
			}
		}

		if (email) {
			await emailModel
				.findByIdAndUpdate(email._id, {
					status: "FAILED",
					errorMessage: error.message,
				})
				.catch(console.error);
		}

		return res.status(500).json({
			success: false,
			message: "Failed to schedule email",
		});
	}
};

// GET: Fetch logged-in user's emails
// const getEmails = async (req, res) => {
// 	try {
// 		const userId = req.user?.userId;

// 		if (!userId) {
// 			return res.status(401).json({
// 				success: false,
// 				message: "Authentication required",
// 			});
// 		}

// 		const { status, search } = req.query;

// 		// const filter = {
// 		// 	userId: String(userId),
// 		// };

// 		const filter = {
// 			userId: userId,
// 		};

// 		// Filter by email status
// 		if (status) {
// 			const allowedStatuses = [
// 				"SCHEDULED",
// 				"PROCESSING",
// 				"SENT",
// 				"FAILED",
// 				"CANCELLED",
// 			];

// 			if (!allowedStatuses.includes(status.toUpperCase())) {
// 				return res.status(400).json({
// 					success: false,
// 					message: "Invalid email status",
// 				});
// 			}

// 			filter.status = status.toUpperCase();
// 		}

// 		// Search by recipient or subject
// 		if (search?.trim()) {
// 			const escapedSearch = search
// 				.trim()
// 				.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 			const searchRegex = new RegExp(escapedSearch, "i");

// 			filter.$or = [{ recipient: searchRegex }, { subject: searchRegex }];
// 		}

// 		const emails = await emailModel
// 			.find(filter)
// 			.populate("userId", "name email")
// 			.sort({ createdAt: -1 })
// 			.limit(100)
// 			.lean();

// 		return res.status(200).json({
// 			success: true,
// 			count: emails.length,
// 			data: emails,
// 		});
// 	} catch (error) {
// 		console.error("Get emails error:", error);

// 		return res.status(500).json({
// 			success: false,
// 			message: "Failed to fetch emails",
// 		});
// 	}
// };

// GET: Fetch and search logged-in user's emails
const getEmails = async (req, res) => {
	try {
		const userId = req.user?.userId;

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		const { status, search, from, to, page = 1, limit = 10 } = req.query;

		const currentPage = Math.max(1, Number(page));
		const pageLimit = Math.min(100, Math.max(1, Number(limit)));

		if (!Number.isInteger(currentPage) || !Number.isInteger(pageLimit)) {
			return res.status(400).json({
				success: false,
				message: "Invalid pagination parameters",
			});
		}

		const filter = {
			userId: userId,
		};

		// Filter by status
		if (status) {
			const allowedStatuses = [
				"SCHEDULED",
				"PROCESSING",
				"SENT",
				"FAILED",
				"CANCELLED",
			];

			const normalizedStatus = status.toUpperCase();

			if (!allowedStatuses.includes(normalizedStatus)) {
				return res.status(400).json({
					success: false,
					message: "Invalid email status",
				});
			}

			filter.status = normalizedStatus;
		}

		// Search recipient, subject and body
		if (search?.trim()) {
			const escapedSearch = search
				.trim()
				.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

			const searchRegex = new RegExp(escapedSearch, "i");

			filter.$or = [
				{ recipient: searchRegex },
				{ subject: searchRegex },
				{ body: searchRegex },
			];
		}

		// Filter by scheduled date range
		if (from || to) {
			filter.scheduledAt = {};

			if (from) {
				const fromDate = new Date(from);

				if (Number.isNaN(fromDate.getTime())) {
					return res.status(400).json({
						success: false,
						message: "Invalid start date",
					});
				}

				filter.scheduledAt.$gte = fromDate;
			}

			if (to) {
				const toDate = new Date(to);

				if (Number.isNaN(toDate.getTime())) {
					return res.status(400).json({
						success: false,
						message: "Invalid end date",
					});
				}

				filter.scheduledAt.$lte = toDate;
			}

			if (
				filter.scheduledAt.$gte &&
				filter.scheduledAt.$lte &&
				filter.scheduledAt.$gte > filter.scheduledAt.$lte
			) {
				return res.status(400).json({
					success: false,
					message: "Start date cannot be after end date",
				});
			}
		}

		// Total matching emails
		const totalEmails = await emailModel.countDocuments(filter);

		// Fetch paginated emails
		const emails = await emailModel
			.find(filter)
			.populate("userId", "name email")
			.sort({ createdAt: -1 })
			.skip((currentPage - 1) * pageLimit)
			.limit(pageLimit)
			.lean();

		return res.status(200).json({
			success: true,
			count: emails.length,
			totalEmails,
			currentPage,
			totalPages: Math.ceil(totalEmails / pageLimit),
			data: emails,
		});
	} catch (error) {
		console.error("Get emails error:", error);

		return res.status(500).json({
			success: false,
			message: "Failed to fetch emails",
		});
	}
};

// GET: Fetch email statistics
const getEmailStats = async (req, res) => {
	try {
		// const userId = req.user?.id;
		const userId = req.user?.userId;

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		const stats = await emailModel.aggregate([
			{
				$match: {
					// userId: String(userId),
					userId: new mongoose.Types.ObjectId(userId),
				},
			},
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		const counts = {
			scheduled: 0,
			processing: 0,
			sent: 0,
			failed: 0,
			cancelled: 0,
		};

		stats.forEach((item) => {
			const key = item._id.toLowerCase();

			if (Object.prototype.hasOwnProperty.call(counts, key)) {
				counts[key] = item.count;
			}
		});

		return res.status(200).json({
			success: true,
			data: counts,
		});
	} catch (error) {
		console.error("Get email stats error:", error);

		return res.status(500).json({
			success: false,
			message: "Failed to fetch email statistics",
		});
	}
};

module.exports = { scheduleEmail, getEmails, getEmailStats };
