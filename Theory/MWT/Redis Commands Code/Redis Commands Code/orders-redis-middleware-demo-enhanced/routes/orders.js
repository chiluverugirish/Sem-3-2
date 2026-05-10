const express = require("express");
const Order = require("../models/Order");
const redis = require("../middleware/redisClient");
const cacheMiddleware = require("../middleware/cacheMiddleware");

const { publish } = require("../services/pubsub");
const { enqueue } = require("../services/queue");
const { upsertOrderScore, topOrders } = require("../services/leaderboard");

const router = express.Router();

/**
 * Leaderboard endpoint:
 * GET /orders/leaderboard/top?limit=5
 * Returns top orders by amount (score) using Redis Sorted Set.
 *
 * NOTE: This route must appear BEFORE "/:id" routes, otherwise Express
 * will treat "leaderboard" as an :id param.
 */
router.get("/leaderboard/top", async (req, res) => {
  const limit = Number(req.query.limit || 10);
  const top = await topOrders(limit);

  // Optional: hydrate with Mongo order docs (kept minimal)
  const orderIds = top.map(t => t.orderId);
  const orders = await Order.find({ _id: { $in: orderIds } }).lean();

  const byId = new Map(orders.map(o => [String(o._id), o]));
  const leaderboard = top.map((t, idx) => ({
    rank: idx + 1,
    amount: t.amount,
    order: byId.get(String(t.orderId)) || { _id: t.orderId }
  }));

  res.json({ source: "redis-zset", leaderboard });
});

/**
 * CREATE ORDER
 * - DB write (Mongo)
 * - Cache invalidation (order:<id>)
 * - Pub/Sub event (orders.events)
 * - Queue job (jobs)
 * - Leaderboard update (sorted set)
 */
router.post("/", async (req, res) => {
  const order = await Order.create({
    product: req.body.product,
    amount: req.body.amount,
    status: "CREATED"
  });

  // Invalidate cache for this order (if present)
  await redis.del(`order:${order._id}`);

  // Pub/Sub: notify "order created"
  await publish({
    type: "ORDER_CREATED",
    orderId: String(order._id),
    product: order.product,
    amount: order.amount,
    at: new Date().toISOString()
  });

  // Queue: add a background job (example: send email)
  await enqueue(`email:order_created:${order._id}`);

  // Leaderboard: store by order amount
  await upsertOrderScore(order._id, order.amount);

  res.status(201).json(order);
});

// READ ORDER (Redis middleware cache)
router.get("/:id", cacheMiddleware, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  await redis.set(req.cacheKey, JSON.stringify(order), {
    EX: 60
  });

  res.json({
    source: "database",
    order
  });
});

/**
 * UPDATE ORDER
 * - DB update (Mongo)
 * - Cache invalidation
 * - Pub/Sub event
 * - Leaderboard update (if amount changes)
 */
router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!order) return res.status(404).json({ error: "Order not found" });

  await redis.del(`order:${order._id}`);

  await publish({
    type: "ORDER_UPDATED",
    orderId: String(order._id),
    updates: req.body,
    at: new Date().toISOString()
  });

  // If amount exists, update leaderboard score
  if (typeof order.amount === "number") {
    await upsertOrderScore(order._id, order.amount);
  }

  res.json(order);
});

module.exports = router;
