let express = require("express");
// const upload = require("../middleware/multer");
let authRoute = express.Router();
const {
	register,
	login,
	getme,
	logout,
    googleLogin
} = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddlewere");

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.post("/google-login", googleLogin);
authRoute.get("/me", authMiddleware, getme);
authRoute.post("/logout", logout);
// authRoute.get("/view", UserView);
// authRoute.get("/employer-view", authMiddlewere, employerView);
// authRoute.get("/jobSeeker-view", authMiddlewere, jobSeekerView);
// authRoute.put("/logo", authMiddlewere, upload.single("logo"), profileLogo);
// authRoute.put(
// 	"/toggle-actively-looking",
// 	authMiddlewere,
// 	toggleActivelyLooking,
// );

module.exports = { authRoute };
