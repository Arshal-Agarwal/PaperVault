const Folder = require("../../models/Folder");
const { getCache, setCache } = require("../../utils/cache");

/**
 * @desc    Get full folder tree for a user as nested JSON {folderId: {childId: {...}}}
 * @route   GET /api/folders/tree/:userId
 */
const getFolderTreeByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cacheKey = `folderTree:${userId}`;

    // ✅ 1. Check Redis cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // ❌ 2. Query DB
    const folders = await Folder.find({ user_id: userId }).lean();
    if (!folders || folders.length === 0) {
      return res.status(404).json({ error: "No folders found for user" });
    }

    // Build a map for easy lookup
    const folderMap = {};
    folders.forEach(f => {
      folderMap[f._id.toString()] = { ...f, children: {} };
    });

    let tree = {};

    // Build the nested tree
    folders.forEach(f => {
      const id = f._id.toString();
      if (f.parent_id) {
        const parentId = f.parent_id.toString();
        if (folderMap[parentId]) {
          folderMap[parentId].children[id] = folderMap[id];
        }
      } else {
        // root folders
        tree[id] = folderMap[id];
      }
    });

    // ✅ 3. Save in cache
    await setCache(cacheKey, JSON.stringify(tree));

    res.json(tree);
  } catch (error) {
    console.error("❌ getFolderTreeByUser error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = getFolderTreeByUser;
