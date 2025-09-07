const Folder = require('../../models/Folder');
const { getCache, setCache } = require('../../utils/cache');

/**
 * @desc    Get direct children of a folder
 * @route   GET /api/folders/:id/children
 */
const getFolderChildren = async (req, res) => {
  try {
    const folderId = req.params.id;
    const cacheKey = `folderChildren:${folderId}`;

    // ✅ Try cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // ❌ Not in cache → query DB
    const children = await Folder.find({ parent_id: folderId }).lean();

    // ✅ Store in cache (short TTL so updates propagate quickly)
    await setCache(cacheKey, JSON.stringify(children), 60); // 60s TTL

    res.json(children);
  } catch (err) {
    console.error("❌ getFolderChildren error:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = getFolderChildren;
