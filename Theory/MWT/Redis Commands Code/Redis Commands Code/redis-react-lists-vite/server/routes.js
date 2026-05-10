
const express = require("express");
const redis = require("./client");
const router = express.Router();

router.post("/lpush", async (req,res)=>{
  const {key, values}=req.body;
  res.json({result: await redis.lpush(key, ...values)});
});

router.post("/rpush", async (req,res)=>{
  const {key, values}=req.body;
  res.json({result: await redis.rpush(key, ...values)});
});

router.get("/lrange/:key", async (req,res)=>{
  const {start, end} = req.query;
  res.json({result: await redis.lrange(req.params.key, start, end)});
});

router.post("/lpop/:key", async (req,res)=>{
  res.json({result: await redis.lpop(req.params.key)});
});

router.post("/rpop/:key", async (req,res)=>{
  res.json({result: await redis.rpop(req.params.key)});
});

router.get("/llen/:key", async (req,res)=>{
  res.json({result: await redis.llen(req.params.key)});
});

router.get("/lindex/:key/:index", async (req,res)=>{
  res.json({result: await redis.lindex(req.params.key, req.params.index)});
});

router.post("/lset", async (req,res)=>{
  const {key,index,value}=req.body;
  await redis.lset(key,index,value);
  res.json({status:"OK"});
});

router.post("/lpushx", async (req,res)=>{
  const {key,value}=req.body;
  res.json({result: await redis.lpushx(key,value)});
});

router.post("/linsert", async (req,res)=>{
  const {key,position,pivot,value}=req.body;
  res.json({result: await redis.linsert(key, position, pivot, value)});
});

module.exports = router;
