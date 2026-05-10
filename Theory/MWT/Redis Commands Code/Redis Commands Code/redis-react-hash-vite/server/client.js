
const { Redis } = require("ioredis");
module.exports = new Redis({ host: "127.0.0.1", port: 6379 });
