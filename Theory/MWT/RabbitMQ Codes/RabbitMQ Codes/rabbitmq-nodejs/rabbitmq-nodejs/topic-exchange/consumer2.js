// consumer2.js
const amqp = require("amqplib");

async function receiveMessages() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "topic_logs";

  await channel.assertExchange(exchange, "topic", { durable: false });

  const q = await channel.assertQueue("", { exclusive: true });

  // Binding pattern
  await channel.bindQueue(q.queue, exchange, "order.#");

  console.log("Consumer 2 waiting for messages (order.#)");

  channel.consume(
    q.queue,
    msg => {
      if (msg) {
        console.log(`Consumer 2 received [${msg.fields.routingKey}] : ${msg.content.toString()}`);
      }
    },
    { noAck: true }
  );
}

receiveMessages();
