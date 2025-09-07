const Folder = require("../../models/Folder");
const publishEvent = require("../../utils/publishEvent");
const { delCache } = require("../../utils/cache");

/**
 * @desc    Hard delete a folder (delete folder + children + papers inside)
 * @route   DELETE /api/folders/hard/:id
 */
const hardDeleteFolder = async (req, res) => {
  try {
    const folderId = req.params.id;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    if (folder.undeletable) {
      return res.status(400).json({ error: "Cannot delete root/undeletable folder" });
    }

    const userId = folder.user_id; // cache invalidation needs this

    // Recursive delete helper
    const deleteRecursively = async (id) => {
      const f = await Folder.findById(id);
      if (!f) return;

      for (const childId of f.children) {
        await deleteRecursively(childId);
      }

      await Folder.findByIdAndDelete(id);

      // 📤 Publish event to paper-service → delete papers in this folder
      await publishEvent("folder_events", {
        type: "FOLDER_DELETED_RECURSIVE",
        folderId: id,
        userId: f.user_id,
        timestamp: Date.now(),
      });
    };

    await deleteRecursively(folderId);

    // Remove from parent's children[]
    if (folder.parent_id) {
      await Folder.findByIdAndUpdate(folder.parent_id, {
        $pull: { children: folder._id },
      });
    }

    // ❌ Invalidate user’s folder tree cache
    await delCache(`folderTree:${userId}`);

    res.json({ message: "Folder and its subfolders hard deleted successfully" });
  } catch (error) {
    console.error("❌ Hard delete error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = hardDeleteFolder;
