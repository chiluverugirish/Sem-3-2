const redis = require("../middleware/redisClient");

const QUEUE_KEY = "jobs";

/**
 * Enqueue a job payload (string). We use LPUSH + BRPOP for FIFO.
 */
async function enqueue(job) {
  try {
    await redis.lPush(QUEUE_KEY, job);
  } catch (err) {
    console.error("Enqueue error:", err.message);
  }
}

module.exports = {
  QUEUE_KEY,
  enqueue
};
