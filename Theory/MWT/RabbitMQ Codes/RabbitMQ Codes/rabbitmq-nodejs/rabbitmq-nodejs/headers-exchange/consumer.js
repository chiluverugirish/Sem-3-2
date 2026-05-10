const amqp = require("amqplib");

async function receiveMessage() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "header_logs";
  const queue = "header_queue";

  await channel.assertExchange(exchange, "headers", { durable: false });
  await channel.assertQueue(queue, { durable: false });

  // Binding with headers
  await channel.bindQueue(queue, exchange, "", {
    "x-match": "all",
    format: "pdf",
    type: "report"
  });

  console.log(" Waiting for messages...");

  channel.consume(queue, (msg) => {
    if (msg) {
      console.log(" Received:", msg.content.toString());
      channel.ack(msg);
    }
  });
}

receiveMessage();
