const amqp = require("amqplib");

async function receiveMessage() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queueName = "logs_queue";

  await channel.assertQueue(queueName, {
    durable: true
  });

  console.log("📥 Waiting for messages...");

  channel.consume(queueName, (msg) => {
    if (msg !== null) {
      console.log("✅ Received:", msg.content.toString());
      channel.ack(msg);
    }
  });
}

receiveMessage().catch(console.error);
