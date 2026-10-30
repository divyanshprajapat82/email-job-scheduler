const { Worker } = require("bullmq");
const nodemailer = require("nodemailer");

const redisConnection = require("../config/redis");
const { getEmailTransporter } = require("../config/emailTransporter");
const { emailModel } = require("../models/EmailModel");

const workerConcurrency = Number(process.env.EMAIL_WORKER_CONCURRENCY || 5);

if (!Number.isInteger(workerConcurrency) || workerConcurrency < 1) {
	throw new Error("EMAIL_WORKER_CONCURRENCY must be a positive integer");
}
console.log(`🚀 Email worker concurrency: ${workerConcurrency}`);

const emailWorker = new Worker(
	"email-queue",
	async (job) => {
		const { emailId } = job.data;

		console.log("📩 Processing email:", emailId);

		const email = await emailModel.findById(emailId);

		if (!email) {
			throw new Error(`Email not found: ${emailId}`);
		}

		if (email.status === "CANCELLED") {
			console.log("Email was cancelled:", emailId);
			return { cancelled: true };
		}

		if (email.status === "SENT") {
			console.log("Email already sent. Skipping:", emailId);
			return { alreadySent: true };
		}

		const sender = getEmailTransporter(email.senderId || "sender-1");

		// if (!sender) {
		// 	throw new Error(`SMTP sender not found: ${email.senderId}`);
		// }

		if (!sender || !sender.transporter || !sender.email) {
			throw new Error(
				`SMTP sender not configured correctly: ${email.senderId}`,
			);
		}

		const claimedEmail = await emailModel.findOneAndUpdate(
			{
				_id: emailId,
				status: "SCHEDULED",
			},
			{
				$set: {
					status: "PROCESSING",
				},
				$inc: {
					attempts: 1,
				},
			},
			{
				new: true,
			},
		);

		if (!claimedEmail) {
			console.log("Email already processing or unavailable:", emailId);

			return { skipped: true };
		}

		try {
			const info = await sender.transporter.sendMail({
				from: `"Email Scheduler" <${sender.email}>`,
				to: claimedEmail.recipient,
				subject: claimedEmail.subject,
				html: claimedEmail.body,
			});

			await emailModel.findByIdAndUpdate(emailId, {
				status: "SENT",
				sentAt: new Date(),
				messageId: info.messageId,
				errorMessage: null,
			});

			console.log("✅ Email sent:", info.messageId);
			console.log("📤 Sender:", sender.email);
			console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

			return {
				success: true,
				messageId: info.messageId,
				senderEmail: sender.email,
			};
		} catch (error) {
			const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts || 1);

			await emailModel.findByIdAndUpdate(emailId, {
				status: isLastAttempt ? "FAILED" : "SCHEDULED",
				errorMessage: error.message,
			});

			console.error("❌ Email sending error:", error.message);

			throw error;
		}
	},
	{
		connection: redisConnection,
		concurrency: workerConcurrency,
	},
);

emailWorker.on("completed", (job) => {
	console.log("✅ Email job completed:", job.id);
});

emailWorker.on("failed", (job, error) => {
	console.error("❌ Email job failed:", job?.id, error.message);
});

emailWorker.on("error", (error) => {
	console.error("❌ Email worker error:", error.message);
});

module.exports = emailWorker;
