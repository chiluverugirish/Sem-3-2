/**
 * Jobs Worker (Queue: LPUSH + BRPOP)
 * Run: node workers/jobsWorker.js
 *
 * Waits forever for jobs in list "jobs". Uses BRPOP jobs 0 (blocking).
 */
const { createClient } = require("redis");

const QUEUE_KEY = "jobs";

async function main() {
  const client = createClient();
  client.on("error", (err) => console.error("Redis Worker Error:", err));

  await client.connect();
  console.log(`👷 Worker connected. Waiting on queue: ${QUEUE_KEY}`);

  while (true) {
    // node-redis v4: brPop(key, timeout)
    const result = await client.brPop(QUEUE_KEY, 0);

    // result usually looks like: { key: 'jobs', element: '...' }
    const job = result?.element ?? (Array.isArray(result) ? result[1] : null);

    if (!job) continue;

    console.log("📥 Got job:", job);

    // Demo "job handler"
    if (job.startsWith("email:order_created:")) {
      const orderId = job.split(":").pop();
      console.log(`✉️  (demo) Sending order-created email for order ${orderId}`);
    } else {
      console.log("🛠️  (demo) Unknown job type:", job);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
