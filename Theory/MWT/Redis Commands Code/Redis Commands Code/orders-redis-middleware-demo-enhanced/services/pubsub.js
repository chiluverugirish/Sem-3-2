const redis = require("../middleware/redisClient");

const CHANNEL = "orders.events";

async function publish(event) {
  try {
    await redis.publish(CHANNEL, JSON.stringify(event));
  } catch (err) {
    console.error("Publish error:", err.message);
  }
}

module.exports = {
  CHANNEL,
  publish
};
