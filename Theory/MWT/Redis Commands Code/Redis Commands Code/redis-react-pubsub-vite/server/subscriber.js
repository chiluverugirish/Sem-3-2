
const { Redis } = require("ioredis");
const sub = new Redis();

sub.subscribe("chat", () => {
  console.log("Subscribed to channel: chat");
});

sub.on("message", (channel, message) => {
  console.log(`Message from ${channel}:`, message);
});

module.exports = sub;
