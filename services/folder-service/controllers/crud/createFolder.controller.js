const Folder = require("../../models/Folder.js");
const { delCache } = require("../../utils/cache.js");

/**
 * @desc    Create a new folder
 * @route   POST /api/folders/crud/create
 * @access  Public (later: protect with auth)
 */
const createFolder = async (req, res) => {
  try {
    let { name, parent_id, user_id, undeletable } = req.body;

    if (undeletable == null) undeletable = false;

    if (!name || !user_id) {
      return res.status(400).json({ error: "Name and user_id are required" });
    }

    // Create new folder
    const folder = new Folder({
      name,
      parent_id: parent_id || null,
      user_id,
      undeletable,
    });

    await folder.save();

    // If it has a parent, update parent children[]
    if (parent_id) {
      await Folder.findByIdAndUpdate(parent_id, {
        $push: { children: folder._id },
      });
    }

    // ❌ Invalidate cache for this user's folder tree
    await delCache(`folderTree:${user_id}`);

    res.status(201).json(folder);
  } catch (error) {
    console.error("❌ Error creating folder:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = createFolder;
