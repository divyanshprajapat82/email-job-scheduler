const mongoose = require("mongoose");
require("dotenv").config();

const startWorker = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("✅ Worker MongoDB connected");

        require("./app/workers/emailWorker");

        console.log("🚀 Email worker started successfully");
    } catch (error) {
        console.error("❌ Worker startup error:", error);
        process.exit(1);
    }
};

startWorker();
