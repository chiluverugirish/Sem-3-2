
const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/redis", routes);

app.listen(5000,()=>console.log("Redis SET Server running on 5000"));
