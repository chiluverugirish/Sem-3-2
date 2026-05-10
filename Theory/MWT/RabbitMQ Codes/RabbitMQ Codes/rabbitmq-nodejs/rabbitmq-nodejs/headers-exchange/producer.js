const amqp = require("amqplib");

async function sendMessage() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "header_logs";

  await channel.assertExchange(exchange, "headers", { durable: false });

  const message = "PDF Report Generated";

  channel.publish(
    exchange,
    "", // routing key ignored in headers exchange
    Buffer.from(message),
    {
      headers: {
        format: "pdf",
        type: "report"
      }
    }
  );

  console.log(" Message sent:", message);

  setTimeout(() => {
    connection.close();
  }, 500);
}

sendMessage();
