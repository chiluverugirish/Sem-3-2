
const express = require("express");
const redis = require("./client");
const router = express.Router();

router.post("/hset", async (req,res)=>{
  const {key, field, value} = req.body;
  res.json({result: await redis.hset(key, field, value)});
});

router.get("/hget/:key/:field", async (req,res)=>{
  res.json({result: await redis.hget(req.params.key, req.params.field)});
});

router.get("/hgetall/:key", async (req,res)=>{
  res.json({result: await redis.hgetall(req.params.key)});
});

router.get("/hlen/:key", async (req,res)=>{
  res.json({result: await redis.hlen(req.params.key)});
});

router.get("/hexists/:key/:field", async (req,res)=>{
  res.json({result: await redis.hexists(req.params.key, req.params.field)});
});

router.delete("/hdel/:key/:field", async (req,res)=>{
  res.json({result: await redis.hdel(req.params.key, req.params.field)});
});

router.get("/hkeys/:key", async (req,res)=>{
  res.json({result: await redis.hkeys(req.params.key)});
});

router.get("/hvals/:key", async (req,res)=>{
  res.json({result: await redis.hvals(req.params.key)});
});

module.exports = router;
