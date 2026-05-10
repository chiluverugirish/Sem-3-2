
const { createClient } = require("redis");

const client = createClient();

client.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  if (!client.isOpen) {
    await client.connect();
    console.log("Redis connected");
  }
})();

module.exports = client;
