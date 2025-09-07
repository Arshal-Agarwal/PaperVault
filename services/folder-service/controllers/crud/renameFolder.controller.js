const Folder = require("../../models/Folder");
const publishEvent = require("../../utils/publishEvent");
const { delCache } = require("../../utils/cache");

/**
 * @desc    Rename a folder
 * @route   PATCH /api/folders/rename/:id
 * @body    { name }
 */
const renameFolder = async (req, res) => {
  try {
    const folderId = req.params.id;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "New folder name is required" });
    }

    // Fetch folder
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    if (folder.undeletable) {
      return res.status(400).json({ error: "Cannot rename undeletable folder" });
    }

    const oldName = folder.name;
    folder.name = name.trim();
    await folder.save();

    // Publish event
    await publishEvent("folder_events", {
      type: "FOLDER_RENAMED",
      folderId,
      oldName,
      newName: folder.name,
      userId: folder.user_id,
      timestamp: Date.now(),
    });

    // ❌ Invalidate cache
    await delCache(`folder:${folderId}`);       // clear single folder cache
    await delCache(`folderTree:${folder.user_id}`); // clear user’s tree cache

    res.json({ message: "Folder renamed successfully", folder });
  } catch (error) {
    console.error("❌ Rename folder error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = renameFolder;
