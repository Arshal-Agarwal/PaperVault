// paper-service/consumers/folderConsumer.js
const { getChannel } = require("../config/connectRabbitMQ");
const Paper = require("../models/Paper");

async function startFolderConsumer() {
  try {
    const channel = getChannel();

    await channel.assertQueue("folder_events", { durable: true });

    console.log("📥 [paper-service] Waiting for folder events...");

    channel.consume(
      "folder_events",
      async (msg) => {
        if (!msg) return;
        const event = JSON.parse(msg.content.toString());
        console.log("📨 [paper-service] Event received:", event);

        try {
          switch (event.type) {
            case "FOLDER_DELETED_RECURSIVE":
              // Delete all papers inside that folder
              await Paper.deleteMany({ folder_id: event.folderId });
              console.log(`🗑️ Deleted papers in folder ${event.folderId}`);
              break;

            case "FOLDER_DELETED_REASSIGN":
              // Reassign papers to parent folder
              await Paper.updateMany(
                { folder_id: event.folderId },
                { folder_id: event.parentId }
              );
              console.log(
                `♻️ Reassigned papers from ${event.folderId} -> ${event.parentId}`
              );
              break;

            case "FOLDER_MOVED":
              // No paper-level changes, but you could log if needed
              console.log(
                `📂 Folder ${event.folderId} moved from ${event.oldParentId} -> ${event.newParentId}`
              );
              break;

            case "FOLDER_RENAMED":
              // Typically no DB changes for papers, but you could log
              console.log(
                `✏️ Folder ${event.folderId} renamed ${event.oldName} -> ${event.newName}`
              );
              break;

            default:
              console.log("⚠️ Unknown event type:", event.type);
          }

          // ✅ Ack after successful handling
          channel.ack(msg);
        } catch (err) {
          console.error("❌ Error handling folder event:", err.message);
          // ❌ Nack with requeue=false to avoid infinite retries
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error("❌ Folder consumer failed:", err.message);
  }
}

module.exports = startFolderConsumer;
