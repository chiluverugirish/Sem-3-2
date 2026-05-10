// producer.js
const amqp = require("amqplib");

async function sendMessage() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "topic_logs";
  const exchangeType = "topic";

  await channel.assertExchange(exchange, exchangeType, { durable: false });

  const messages = [
    { key: "order.created", msg: "Order created" },
    { key: "order.shipped", msg: "Order shipped" },
    { key: "payment.success", msg: "Payment successful" },
    { key: "order.created.online", msg: "Online order created" }
  ];

  messages.forEach(m => {
    channel.publish(exchange, m.key, Buffer.from(m.msg));
    console.log(`Sent [${m.key}] : ${m.msg}`);
  });

  setTimeout(() => {
    connection.close();
  }, 500);
}

sendMessage();
no