
const redis = require("./redisClient");

// Redis cache middleware for GET /orders/:id
module.exports = async function cacheMiddleware(req, res, next) {
  const orderId = req.params.id;
  if (!orderId) return next();

  const cacheKey = `order:${orderId}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    return res.json({
      source: "cache",
      order: JSON.parse(cachedData)
    });
  }

  req.cacheKey = cacheKey;
  next();
};
