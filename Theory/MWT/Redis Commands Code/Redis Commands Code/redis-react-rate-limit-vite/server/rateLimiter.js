
const redis = require("./client");

const LIMIT = 5;        // max requests
const WINDOW = 60;     // seconds

module.exports = async function rateLimiter(req, res, next) {
  const ip = req.ip;
  const key = `rate:${ip}`;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, WINDOW);
  }

  if (current > LIMIT) {
    return res.status(429).json({
      error: "Too many requests",
      retryAfter: WINDOW
    });
  }

  next();
};
