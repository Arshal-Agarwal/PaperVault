const Folder = require("../../models/Folder");
const publishEvent = require("../../utils/publishEvent");

/**
 * @desc    Soft delete a folder (move children + papers up to parent)
 * @route   DELETE /api/folders/soft/:id
 */
const softDeleteFolder = async (req, res) => {
  try {
    const folderId = req.params.id;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    if (folder.undeletable) {
      return res.status(400).json({ error: "Cannot delete root/undeletable folder" });
    }

    // Reassign children to parent
    if (folder.children.length > 0) {
      await Folder.updateMany(
        { _id: { $in: folder.children } },
        { parent_id: folder.parent_id }
      );
    }

    // 1. Remove the deleted folder from parent’s children
    if (folder.parent_id) {
      await Folder.findByIdAndUpdate(folder.parent_id, {
        $pull: { children: folder._id }
      });

      // 2. Add folder’s children to parent’s children
      if (folder.children.length > 0) {
        await Folder.findByIdAndUpdate(folder.parent_id, {
          $push: { children: { $each: folder.children } }
        });
      }
    }


    // Delete the folder
    await Folder.findByIdAndDelete(folderId);

    // 📤 Publish event to paper-service → reassign papers
    await publishEvent("folder_events", {
      type: "FOLDER_DELETED_REASSIGN",
      folderId,
      parentId: folder.parent_id,
      userId: folder.user_id,
      timestamp: Date.now(),
    });

    res.json({ message: "Folder soft deleted and reassigned successfully" });
  } catch (error) {
    console.error("❌ Soft delete error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = softDeleteFolder;
