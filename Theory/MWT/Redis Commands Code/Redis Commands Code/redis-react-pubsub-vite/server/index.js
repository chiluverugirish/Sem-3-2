
const express = require("express");
const cors = require("cors");
const pub = require("./publisher");
require("./subscriber");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/publish", async (req,res)=>{
  const {message} = req.body;
  await pub.publish("chat", message);
  res.json({status:"PUBLISHED"});
});

app.listen(5000,()=>console.log("Redis Pub/Sub Server running on 5000"));
