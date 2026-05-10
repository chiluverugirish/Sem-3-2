
const express = require("express");
const redis = require("./client");
const router = express.Router();

router.post("/sadd", async (req,res)=>{
  const {key, values} = req.body;
  res.json({result: await redis.sadd(key, ...values)});
});

router.get("/smembers/:key", async (req,res)=>{
  res.json({result: await redis.smembers(req.params.key)});
});

router.post("/srem", async (req,res)=>{
  const {key, values} = req.body;
  res.json({result: await redis.srem(key, ...values)});
});

router.get("/scard/:key", async (req,res)=>{
  res.json({result: await redis.scard(req.params.key)});
});

router.get("/sismember/:key/:value", async (req,res)=>{
  res.json({result: await redis.sismember(req.params.key, req.params.value)});
});

router.get("/srandmember/:key", async (req,res)=>{
  res.json({result: await redis.srandmember(req.params.key)});
});

router.get("/spop/:key", async (req,res)=>{
  res.json({result: await redis.spop(req.params.key)});
});

module.exports = router;
