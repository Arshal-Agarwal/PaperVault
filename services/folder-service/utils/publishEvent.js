const { getChannel } = require("../config/connectRabbitMQ");

/**
 * Publish an event to a RabbitMQ queue
 * @param {string} queue - Name of the queue (e.g. "folder_events")
 * @param {Object} event - Event payload
 */
async function publishEvent(queue, event) {
  try {
    const channel = getChannel();
    await channel.assertQueue(queue, { durable: true });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(event)), {
      persistent: true,
    });

    console.log(`📤 Event published to [${queue}]:`, event);
  } catch (err) {
    console.error("❌ Failed to publish event:", err.message);
  }
}

module.exports = publishEvent;
