const mongoose = require("mongoose");

let userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},

		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},

		// phone: {
		// 	type: String,
		// 	required: true,
		// },

		password: {
			type: String,
			// required: true,
		},

		logo: String,
		public_id: String,
	},
	{
		timestamps: true,
	},
);

let UserModel = mongoose.model("User", userSchema);

module.exports = { UserModel };
