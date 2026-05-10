/**
 * Order Event Subscriber (Pub/Sub)
 * Run: node workers/orderEventSubscriber.js
 *
 * Listens on Redis channel "orders.events" and prints incoming messages.
 */
const { createClient } = require("redis");

const CHANNEL = "orders.events";

async function main() {
  const sub = createClient();
  sub.on("error", (err) => console.error("Redis Subscriber Error:", err));

  await sub.connect();
  console.log(`✅ Subscriber connected. Listening on channel: ${CHANNEL}`);

  await sub.subscribe(CHANNEL, (message) => {
    try {
      const event = JSON.parse(message);
      console.log("📣 Event:", event);
    } catch {
      console.log("📣 Raw message:", message);
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
