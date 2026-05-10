const redis = require("./redisClient");

/**
 * Simple Redis-backed rate limiter (fixed window).
 * - Keyed by IP + route
 * - INCR + EXPIRE
 * This is intentionally simple for demo purposes.
 */
module.exports = function rateLimit(options = {}) {
  const windowSeconds = Number(options.windowSeconds ?? 60);
  const maxRequests = Number(options.maxRequests ?? 30);

  return async function rateLimitMiddleware(req, res, next) {
    try {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const route = req.baseUrl + (req.path || "");
      const key = `rl:${ip}:${route}`;

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        const ttl = await redis.ttl(key);
        return res.status(429).json({
          error: "Too many requests",
          hint: `Try again in ${ttl >= 0 ? ttl : windowSeconds} seconds`,
          windowSeconds,
          maxRequests
        });
      }

      next();
    } catch (err) {
      // If Redis is down, we don't want the whole API to stop.
      // Allow request through (fail-open) for this demo.
      console.error("Rate limiter error:", err.message);
      next();
    }
  };
};
