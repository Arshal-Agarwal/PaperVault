const Folder = require("../../models/Folder");
const publishEvent = require("../../utils/publishEvent");
const { delCache } = require("../../utils/cache");

/**
 * @desc    Move a folder to a new parent
 * @route   PATCH /api/folders/move/:id
 * @body    { newParentId }
 */
const moveFolder = async (req, res) => {
  try {
    const folderId = req.params.id;
    const { newParentId } = req.body;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    if (folder.undeletable) {
      return res.status(400).json({ error: "Cannot move root/undeletable folder" });
    }

    // Prevent moving into itself
    if (folderId === newParentId) {
      return res.status(400).json({ error: "Cannot move folder into itself" });
    }

    // ✅ Check new parent exists and belongs to the same user
    if (newParentId) {
      const newParent = await Folder.findById(newParentId);
      if (!newParent) {
        return res.status(404).json({ error: "New parent folder not found" });
      }
      if (newParent.user_id !== folder.user_id) {
        return res.status(403).json({ error: "Cannot move folder to another user's tree" });
      }
    }

    // Prevent moving into its own descendants
    const isDescendant = async (parentId, targetId) => {
      if (!parentId) return false;
      if (parentId.toString() === targetId.toString()) return true;

      const parent = await Folder.findById(parentId);
      if (!parent || parent.children.length === 0) return false;

      for (const childId of parent.children) {
        if (await isDescendant(childId, targetId)) return true;
      }

      return false;
    };
    if (await isDescendant(newParentId, folderId)) {
      return res.status(400).json({ error: "Cannot move folder into its descendant" });
    }

    // Remove from old parent's children[]
    if (folder.parent_id) {
      await Folder.findByIdAndUpdate(folder.parent_id, {
        $pull: { children: folder._id },
      });
    }

    // Add to new parent's children[]
    if (newParentId) {
      await Folder.findByIdAndUpdate(newParentId, {
        $push: { children: folder._id },
      });
    }

    // Update folder’s parent_id
    const oldParentId = folder.parent_id;
    folder.parent_id = newParentId || null;
    await folder.save();

    // 📤 Publish event → notify paper-service
    await publishEvent("folder_events", {
      type: "FOLDER_MOVED",
      folderId,
      oldParentId,
      newParentId,
      userId: folder.user_id,
      timestamp: Date.now(),
    });

    // ❌ Invalidate relevant cache
    await delCache(`folder:${folderId}`); // clear single folder cache
    await delCache(`folderTree:${folder.user_id}`); // clear user’s tree

    res.json({ message: "Folder moved successfully", folder });
  } catch (error) {
    console.error("❌ Move folder error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = moveFolder;
