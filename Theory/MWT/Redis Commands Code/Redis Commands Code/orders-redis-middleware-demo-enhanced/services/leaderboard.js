const redis = require("../middleware/redisClient");

const LB_KEY = "leaderboard:top_orders";

/**
 * Store orderId with score=amount in a Sorted Set.
 * Uses ZADD (replace score if exists).
 */
async function upsertOrderScore(orderId, amount) {
  try {
    // node-redis v4: zAdd(key, [{ score, value }])
    await redis.zAdd(LB_KEY, [{ score: Number(amount), value: String(orderId) }]);
  } catch (err) {
    // fallback using raw command (in case of API mismatch)
    try {
      await redis.sendCommand(["ZADD", LB_KEY, String(amount), String(orderId)]);
    } catch (e2) {
      console.error("Leaderboard upsert error:", e2.message);
    }
  }
}

/**
 * Return top N orderIds with scores (highest first).
 */
async function topOrders(limit = 10) {
  const n = Number(limit);
  try {
    // node-redis v4: zRangeWithScores(key, start, stop, { REV: true })
    const rows = await redis.zRangeWithScores(LB_KEY, 0, n - 1, { REV: true });
    return rows.map(r => ({ orderId: r.value, amount: Number(r.score) }));
  } catch (err) {
    // fallback: ZREVRANGE key 0 n-1 WITHSCORES
    const raw = await redis.sendCommand(["ZREVRANGE", LB_KEY, "0", String(n - 1), "WITHSCORES"]);
    const out = [];
    for (let i = 0; i < raw.length; i += 2) {
      out.push({ orderId: raw[i], amount: Number(raw[i + 1]) });
    }
    return out;
  }
}

module.exports = {
  LB_KEY,
  upsertOrderScore,
  topOrders
};
