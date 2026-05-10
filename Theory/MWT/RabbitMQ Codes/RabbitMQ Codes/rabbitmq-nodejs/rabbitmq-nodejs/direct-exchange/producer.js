const amqp = require("amqplib");

async function sendMessage() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchangeName = "logs_exchange";
  const exchangeType = "direct";
  const queueName = "logs_queue";
  const routingKey = "info";

  // Create exchange
  await channel.assertExchange(exchangeName, exchangeType, {
    durable: true
  });

  // Create named queue
  await channel.assertQueue(queueName, {
    durable: true
  });

  // Bind queue to exchange
  await channel.bindQueue(queueName, exchangeName, routingKey);

  const message = "jai girish5";

  // Publish message
  channel.publish(
    exchangeName,
    routingKey,
    Buffer.from(message)
  );

  console.log("📤 Message sent:", message);

  setTimeout(() => {
    connection.close();
  }, 500);
}

sendMessage().catch(console.error);
