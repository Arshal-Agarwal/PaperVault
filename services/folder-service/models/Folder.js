import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null, // null = root folder
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
      },
    ],
    user_id: {
      type: String, // storing MySQL user_id as string/number reference
      required: true,
    },
  },
  { timestamps: true } // adds createdAt, updatedAt
);

// Index for faster lookups by parent
folderSchema.index({ parent_id: 1, user_id: 1 });

const Folder = mongoose.model("Folder", folderSchema);

export default Folder;
