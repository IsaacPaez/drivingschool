import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    image: {
      type: String,
      required: true,
    },
    href: {
      type: String,
      default: "",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { collection: "resources", timestamps: true }
);

ResourceSchema.index({ order: 1 });

export default mongoose.models.Resource ||
  mongoose.model("Resource", ResourceSchema);
