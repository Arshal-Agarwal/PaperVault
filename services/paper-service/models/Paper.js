// models/Paper.js
const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  folder_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
  file_url: { type: String, required: true },
  cloudinary_public_id: { type: String, required: true }, // <-- ADD THIS
  user_id: { type: String, required: true },
  metadata: { type: Object, default: null },
  tags: [String],
  ai_status: { type: String, enum: ['pending', 'processing', 'processed'], default: 'pending' },
  rating: { avg: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = mongoose.model('Paper', paperSchema);

