const amqp = require("amqplib");

async function receiveMessage() {
  const url = "amqp://guest:guest@127.0.0.1:5672";

  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  const exchangeName = "logs";

  await channel.assertExchange(exchangeName, "fanout", {
    durable: false,
  });

  const q = await channel.assertQueue("", {
    exclusive: true,
  });

  await channel.bindQueue(q.queue, exchangeName, "");

  console.log(" [*] Waiting for messages. To exit press CTRL+C");

  channel.consume(
    q.queue,
    (msg) => {
      if (msg.content) {
        console.log(" [x] Received:", msg.content.toString());
      }
    },
    {
      noAck: true,
    }
  );
}

// 🔴 THIS LINE IS CRITICAL
receiveMessage();
