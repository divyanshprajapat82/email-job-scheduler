const nodemailer = require("nodemailer");

const emailTransporters = [
	{
		id: "sender-1",
		email: process.env.ETHEREAL_USER_1,
		transporter: nodemailer.createTransport({
			host: "smtp.ethereal.email",
			port: 587,
			secure: false,
			auth: {
				user: process.env.ETHEREAL_USER_1,
				pass: process.env.ETHEREAL_PASS_1,
			},
		}),
	},
	{
		id: "sender-2",
		email: process.env.ETHEREAL_USER_2,
		transporter: nodemailer.createTransport({
			host: "smtp.ethereal.email",
			port: 587,
			secure: false,
			auth: {
				user: process.env.ETHEREAL_USER_2,
				pass: process.env.ETHEREAL_PASS_2,
			},
		}),
	},
	{
		id: "sender-3",
		email: process.env.ETHEREAL_USER_3,
		transporter: nodemailer.createTransport({
			host: "smtp.ethereal.email",
			port: 587,
			secure: false,
			auth: {
				user: process.env.ETHEREAL_USER_3,
				pass: process.env.ETHEREAL_PASS_3,
			},
		}),
	},
];

const getEmailTransporter = (senderId) => {
	return emailTransporters.find((sender) => sender.id === senderId);
};

module.exports = {
	emailTransporters,
	getEmailTransporter,
};
