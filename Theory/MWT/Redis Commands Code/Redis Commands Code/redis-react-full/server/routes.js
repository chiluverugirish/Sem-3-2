
const express = require("express");
const redis = require("./client");
const router = express.Router();

router.post("/set", async (req,res)=>{
  const {key,value}=req.body;
  await redis.set(key,value);
  res.json({status:"OK"});
});

router.get("/get/:key", async (req,res)=>{
  const val = await redis.get(req.params.key);
  res.json({value:val});
});

router.post("/setex", async (req,res)=>{
  const {key,seconds,value}=req.body;
  await redis.setex(key,seconds,value);
  res.json({status:"OK"});
});

router.post("/incr/:key", async (req,res)=>{
  res.json({value: await redis.incr(req.params.key)});
});

router.post("/decr/:key", async (req,res)=>{
  res.json({value: await redis.decr(req.params.key)});
});

router.delete("/del/:key", async (req,res)=>{
  await redis.del(req.params.key);
  res.json({status:"DELETED"});
});

router.get("/keys", async (req,res)=>{
  res.json({keys: await redis.keys("*")});
});

router.delete("/flushall", async (req,res)=>{
  await redis.flushall();
  res.json({status:"FLUSHED"});
});

module.exports = router;
