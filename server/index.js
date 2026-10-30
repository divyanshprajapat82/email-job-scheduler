// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// require("dotenv").config();
// // const nodemailer = require("nodemailer");

// const { webRoute } = require("./app/routers/webRoute");
// const cookieParser = require("cookie-parser");
// // const { adminRoute } = require("./app/routers/admin/adminRoute");

// const app = express();
// app.use(cookieParser());
// app.use(express.json());

// // app.use(
// // 	cors({
// // 		origin: "http://localhost:3000",
// // 		credentials: true,
// // 	}),
// // );

// // app.use(
// // 	cors({
// // 		origin: ["https://email-job-scheduler-steel.vercel.app"],
// // 		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// // 		allowedHeaders: ["Content-Type", "Authorization"],
// // 		credentials: true,
// // 	}),
// // );

// const allowedOrigins = [
// 	"http://localhost:3000",
// 	"https://email-job-scheduler-steel.vercel.app",
// ];

// app.use(
// 	cors({
// 		origin: allowedOrigins,
// 		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
// 		allowedHeaders: ["Content-Type", "Authorization"],
// 		credentials: true,
// 	}),
// );

// app.use("/web", webRoute);
// const dns = require("dns");

// dns.setServers(["8.8.8.8", "1.1.1.1"]);

// // (async () => {
// // 	try {
// // 		// await mongoose.connect("mongodb://127.0.0.1:27017/jobListener", {
// // 		await mongoose.connect(process.env.MONGODB_URL, {
// // 			serverSelectionTimeoutMS: 5000,
// // 		});

// // 		console.log("✅ MongoDB connected:", mongoose.connection.name);
// // 		require("./app/workers/emailWorker");

// // 		// console.log("JWT_SECRET loaded:", Boolean(process.env.JWT_SECRET));

// // 		app.listen(process.env.PORT || 8000, () => {
// // 			console.log("🚀 Server running on PORT", process.env.PORT || 8000);
// // 		});
// // 	} catch (err) {
// // 		console.log("❌ MongoDB connect error:", err.message);
// // 	}
// // })();

// let isConnected = false;

// app.use(async (req, res, next) => {
// 	try {
// 		if (mongoose.connection.readyState !== 1) {
// 			await mongoose.connect(process.env.MONGODB_URL, {
// 				serverSelectionTimeoutMS: 10000,
// 			});
// 		}

// 		isConnected = true;
// 		next();
// 	} catch (error) {
// 		console.error("MongoDB connection error:", error.message);
// 		res.status(500).json({
// 			success: false,
// 			message: "Database connection failed",
// 		});
// 	}
// });

// // app.use(
// //   cors({
// //     origin: "http://localhost:3000",
// //     credentials: true,
// //   }),
// // );

// // const transporter = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.EMAIL_PASSWWORD
// //   }
// // })

// // const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];

// // app.use(
// // 	cors({
// // 		origin: function (origin, callback) {
// // 			if (!origin || allowedOrigins.includes(origin)) {
// // 				callback(null, true);
// // 			} else {
// // 				callback(new Error("Not allowed by CORS"));
// // 			}
// // 		},
// // 		credentials: true,
// // 	}),
// // );

// // dns.resolveSrv("_mongodb._tcp.cluster0.3annhhh.mongodb.net", (err, records) => {
// //   console.log("Error:", err);
// //   console.log("Records:", records);
// // });

// // const uri =
// //   "mongodb+srv://divyanshprajapat82_db_user:sTD5eyC68QekwnWM@cluster0.3annhhh.mongodb.net/joblistener?retryWrites=true&w=majority&appName=Cluster0";

// // mongoose
// //   .connect(uri, {
// //     // 💡 2. FORCES IPV4 LOOKUP TO BYPASS FAULTY INTERNET PROVIDER DNS LOOKUPS
// //     family: 4
// //   })
// //   .then(() => {
// //     console.log("✅ Connected");
// //   })
// //   .catch((err) => {
// //     console.error("❌ Connection failed:", err);
// //   });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dns = require("dns");
require("dotenv").config();

const { webRoute } = require("./app/routers/webRoute");

const app = express();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const allowedOrigins = [
	"http://localhost:3000",
	"https://email-job-scheduler-steel.vercel.app",
];

// 1. CORS middleware
app.use(
	cors({
		origin: allowedOrigins,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

// 2. Common middleware
app.use(cookieParser());
app.use(express.json());

// 3. MongoDB connection middleware
app.use(async (req, res, next) => {
	try {
		if (!process.env.MONGODB_URL) {
			throw new Error("MONGODB_URL is missing");
		}

		if (mongoose.connection.readyState !== 1) {
			await mongoose.connect(process.env.MONGODB_URL, {
				serverSelectionTimeoutMS: 10000,
			});

			console.log("MongoDB connected:", mongoose.connection.name);
		}

		next();
	} catch (error) {
		console.error("MongoDB connection error:", error.message);

		return res.status(500).json({
			success: false,
			message: "Database connection failed",
		});
	}
});

// 4. API routes
app.use("/web", webRoute);

// 5. Local development server
if (require.main === module) {
	const PORT = process.env.PORT || 8000;

	app.listen(PORT, () => {
		console.log(`Server running on PORT ${PORT}`);
	});
}

// 6. Export Express app for Vercel
module.exports = app;
