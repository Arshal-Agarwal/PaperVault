const amqp = require("amqplib");

let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    console.log("🐇 Connected to RabbitMQ");
  } catch (err) {
    console.error("❌ RabbitMQ connection failed:", err.message);
  }
}

function getChannel() {
  if (!channel) throw new Error("Channel not initialized");
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };
