const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
	{
		// userId: {
		// 	type: String,
		// 	required: true,
		// 	index: true,
		// },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},

		recipient: {
			type: String,
			required: true,
			trim: true,
		},

		recipientName: {
			type: String,
			default: "",
		},

		senderId: {
			type: String,
			default: "sender-1",
			required: true,
		},

		senderEmail: {
			type: String,
			default: () => process.env.ETHEREAL_USER_1 || "",
		},

		subject: {
			type: String,
			required: true,
		},

		body: {
			type: String,
			required: true,
		},

		scheduledAt: {
			type: Date,
			required: true,
			index: true,
		},

		sentAt: {
			type: Date,
			default: null,
		},

		status: {
			type: String,
			enum: ["SCHEDULED", "PROCESSING", "SENT", "FAILED", "CANCELLED"],
			default: "SCHEDULED",
			index: true,
		},

		bullJobId: {
			type: String,
			default: null,
		},

		messageId: {
			type: String,
			default: null,
		},

		errorMessage: {
			type: String,
			default: null,
		},

		attempts: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	},
);

emailSchema.index({ userId: 1, status: 1 });
emailSchema.index({ userId: 1, scheduledAt: 1 });

// module.exports = mongoose.model("Email", emailSchema);
const emailModel = mongoose.model("Email", emailSchema);
module.exports = { emailModel };
