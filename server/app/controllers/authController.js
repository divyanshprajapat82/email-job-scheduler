const { UserModel } = require("../models/UserModel");
// const jwt = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

let register = async (req, res) => {
	let { name, email, password } = req.body;

	try {
		let exists = await UserModel.findOne({ email });

		if (exists) {
			return res.status(409).json({
				success: false,
				message: "Email already exists",
			});
		}

		let obj = { name, email, password };
		let data = await UserModel.create(obj);

		res.send({
			success: true,
			message: "You Registered Successfully",
			data,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};

let login = async (req, res) => {
	let { email, password } = req.body;

	try {
		let user = await UserModel.findOne({ email });

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Email not found",
			});
		}

		const token = jwt.sign(
			{
				userId: user._id,
				role: user.role,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "7d" },
		);

		res
			.cookie("token", token, {
				httpOnly: true,
				secure: true,
				sameSite: "none",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			})
			.status(200)
			.json({
				success: true,
				message: "Login Successful",
				data: {
					name: user.name,
					email: user.email,
				},
				token,
			});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};

let getme = async (req, res) => {
	const id = req.user.userId;
	const data = await UserModel.findById(id).select("-password");
	if (!data) {
		return res.status(404).json({
			success: false,
			message: "User not found",
		});
	}

	res.json({
		success: true,
		data,
	});
};

let logout = async (req, res) => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: false,
		sameSite: "lax",
	});

	res.json({
		success: true,
		message: "Logout successful",
	});
};

// let googleLogin = async (req, res) => {
// 	let { name, email } = req.body;

// 	try {
// 		let user = await UserModel.findOne({ email });

// 		if (user) {
// 			const token = jwt.sign(
// 				{
// 					userId: user._id,
// 					name: user.name,
// 				},
// 				process.env.JWT_SECRET,
// 				{ expiresIn: "7d" },
// 			);

// 			res
// 				.cookie("token", token, {
// 					httpOnly: true,
// 					secure: false,
// 					sameSite: "lax",
// 					maxAge: 7 * 24 * 60 * 60 * 1000,
// 				})
// 				.status(200)
// 				.json({
// 					success: true,
// 					message: "Login Successful",
// 					data: {
// 						name: user.name,
// 						email: user.email,
// 					},
// 					token,
// 				});
// 		} else {
// 			let obj = { name, email };
// 			let data = await UserModel.create(obj);

//             const token = jwt.sign(
// 				{
// 					userId: user._id,
// 					name: user.name,
// 				},
// 				process.env.JWT_SECRET,
// 				{ expiresIn: "7d" },
// 			);

// 			res
// 				.cookie("token", token, {
// 					httpOnly: true,
// 					secure: false,
// 					sameSite: "lax",
// 					maxAge: 7 * 24 * 60 * 60 * 1000,
// 				})
// 				.status(200)
// 				.json({
// 					success: true,
// 					message: "Login Successful",
// 					data: {
// 						name: user.name,
// 						email: user.email,
// 					},
// 					token,
// 				});

// 		// 	res.send({
// 		// 		success: true,
// 		// 		message: "You Registered Successfully",
// 		// 		data,
// 		// 	});
// 		// }
// 	} catch (error) {
// 		res.status(500).json({
// 			success: false,
// 			message: "Server error",
// 			error: error.message,
// 		});
// 	}}
// };

let googleLogin = async (req, res) => {
	const { name, email } = req.body;

	try {
		let user = await UserModel.findOne({ email });

		// If the user does not exist, create a new user
		if (!user) {
			user = await UserModel.create({
				name,
				email,
			});
		}

		// Generate JWT token
		const token = jwt.sign(
			{
				userId: user._id,
				name: user.name,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "7d" },
		);

		// Store token in an HTTP-only cookie
		return res
			.cookie("token", token, {
				httpOnly: true,
				secure: true, // Use true with HTTPS in production
				sameSite: "none",
				maxAge: 7 * 24 * 60 * 60 * 1000,
				path: "/",
			})
			.status(200)
			.json({
				success: true,
				message: "Google login successful",
				data: {
					name: user.name,
					email: user.email,
				},
			});
	} catch (error) {
		console.error("Google login error:", error);

		return res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};

module.exports = { register, login, getme, logout, googleLogin };
