const Folder = require("../../models/Folder");

/**
 * @desc    Get folder by ID
 * @route   GET /api/folders/:id
 * @query   optional: ?user_id=u1
 */
const getFolderById = async (req, res) => {
  try {
    const folderId = req.params.id;
    const userId = req.query.user_id; // optional ownership check

    const folder = await Folder.findById(folderId).lean();
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    if (userId && folder.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(folder);
  } catch (error) {
    console.error("❌ getFolderById error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = getFolderById;
