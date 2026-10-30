const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
	try {
		const token = req.cookies?.token;

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "Token not found",
			});
		}

		if (!process.env.JWT_SECRET) {
			console.error("JWT_SECRET is missing");
			return res.status(500).json({
				success: false,
				message: "Server authentication configuration error",
			});
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		req.user = decoded;

		next();
	} catch (error) {
		console.error("JWT verification error:", error.name, error.message);

		return res.status(401).json({
			success: false,
			message: "Invalid or expired token",
		});
	}
};

module.exports = { authMiddleware };
