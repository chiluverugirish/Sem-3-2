const amqp = require("amqplib");

async function publishMessage() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchangeName = "logs";

  await channel.assertExchange(exchangeName, "fanout", {
    durable: false,
  });

  const message = "Hello Subscribers! This is a Pub/Sub message.";

  channel.publish(exchangeName, "", Buffer.from(message));
  console.log(" [x] Sent:", message);

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
}

publishMessage();
