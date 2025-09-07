const Folder = require('../../models/Folder');
const { getCache, setCache } = require('../../utils/cache');

/**
 * @desc    Get breadcrumbs / path from root to folder
 * @route   GET /api/folders/:id/path
 */
const getFolderPath = async (req, res) => {
  try {
    const folderId = req.params.id;
    const cacheKey = `folderPath:${folderId}`;

    // ✅ 1. Check cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // ❌ 2. Build path if not cached
    const path = [];
    let current = await Folder.findById(folderId).lean();
    if (!current) return res.status(404).json({ error: 'Folder not found' });

    while (current) {
      path.unshift({ _id: current._id, name: current.name });
      if (!current.parent_id) break;
      current = await Folder.findById(current.parent_id).lean();
    }

    // ✅ 3. Cache result (longer TTL since path rarely changes)
    await setCache(cacheKey, JSON.stringify(path), 300); // 5 min

    res.json(path);
  } catch (err) {
    console.error("❌ getFolderPath error:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = getFolderPath;
