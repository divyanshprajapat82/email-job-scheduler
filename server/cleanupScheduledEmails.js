require("dotenv").config();

const mongoose = require("mongoose");

const { emailModel } = require("./app/models/EmailModel");
const emailQueue = require("./app/queues/emailQueue");
const redisConnection = require("./app/config/redis");

const USER_ID = "6ae39ca8ce8de356cd0bc817";
const SENDER_ID = "sender-1";

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const cleanup = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URL);

		console.log("MongoDB connected");

		// Find pending test emails for this user and sender.
		const emails = await emailModel.find({
			userId: USER_ID,
			senderId: SENDER_ID,
			status: "SCHEDULED",
		});

		console.log("Scheduled emails found:", emails.length);

		let cancelled = 0;
		let skipped = 0;

		for (const email of emails) {
			const jobId = email.bullJobId || email._id.toString();

			const job = await emailQueue.getJob(jobId);

			if (job) {
				const state = await job.getState();

				// Never remove a job that is currently sending.
				if (state === "active") {
					console.log("Skipped active job:", jobId);
					skipped++;
					continue;
				}

				await job.remove();
			}

			// Remove its Redis reservation.
			await redisConnection.zrem(
				`email-rate:${USER_ID}:${SENDER_ID}`,
				email._id.toString(),
			);

			// Update MongoDB status.
			await emailModel.findByIdAndUpdate(email._id, {
				status: "CANCELLED",
				errorMessage: "Cancelled during test data cleanup",
			});

			console.log("Cancelled:", email._id.toString());

			cancelled++;
		}

		console.log("\nCleanup completed");
		console.log("Cancelled:", cancelled);
		console.log("Skipped:", skipped);
	} catch (error) {
		console.error("Cleanup error:", error);
	} finally {
		await emailQueue.close();
		await redisConnection.quit();
		await mongoose.disconnect();
	}
};

cleanup();
