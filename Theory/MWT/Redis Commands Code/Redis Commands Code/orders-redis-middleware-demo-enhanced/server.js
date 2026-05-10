const express = require("express");
const mongoose = require("mongoose");
const orderRoutes = require("./routes/orders");
const rateLimit = require("./middleware/rateLimit");

const app = express();

// If behind a proxy/load balancer (common in production), this helps req.ip be correct.
app.set("trust proxy", 1);

app.use(express.json());

// Apply Redis-backed rate limiting to all routes (demo values)
app.use(rateLimit({ windowSeconds: 60, maxRequests: 30 }));

mongoose.connect("mongodb://localhost:27017/orders_redis_middleware_demo")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.use("/orders", orderRoutes);

app.listen(3000, () => {
  console.log("Orders Redis Middleware Demo running on http://localhost:3000");
  console.log("New features: rate limiting, pub/sub events, jobs queue, leaderboard.");
  console.log("Try: GET /orders/leaderboard/top?limit=5");
});
