const { Queue } = require("bullmq");
const redisConnection = require("../config/redis");

const emailQueue = new Queue("email-queue", {
  connection: redisConnection,
});

module.exports = emailQueue;