
const express = require("express");
const cors = require("cors");
const rateLimiter = require("./rateLimiter");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/data", rateLimiter, (req,res)=>{
  res.json({message:"Request successful"});
});

app.listen(5000,()=>console.log("Rate Limit Server running on 5000"));
