
const express = require("express");
const redis = require("./client");
const router = express.Router();

router.post("/zadd", async (req,res)=>{
  const {key, score, member} = req.body;
  res.json({result: await redis.zadd(key, score, member)});
});

router.get("/zrange/:key", async (req,res)=>{
  const {start=0, end=-1} = req.query;
  res.json({result: await redis.zrange(req.params.key, start, end, "WITHSCORES")});
});

router.get("/zrevrange/:key", async (req,res)=>{
  const {start=0, end=-1} = req.query;
  res.json({result: await redis.zrevrange(req.params.key, start, end, "WITHSCORES")});
});

router.get("/zscore/:key/:member", async (req,res)=>{
  res.json({result: await redis.zscore(req.params.key, req.params.member)});
});

router.get("/zrank/:key/:member", async (req,res)=>{
  res.json({result: await redis.zrank(req.params.key, req.params.member)});
});

router.get("/zrevrank/:key/:member", async (req,res)=>{
  res.json({result: await redis.zrevrank(req.params.key, req.params.member)});
});

router.get("/zcard/:key", async (req,res)=>{
  res.json({result: await redis.zcard(req.params.key)});
});

router.post("/zrem", async (req,res)=>{
  const {key, member} = req.body;
  res.json({result: await redis.zrem(key, member)});
});

module.exports = router;
