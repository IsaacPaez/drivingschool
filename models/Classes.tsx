import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    alsoKnownAs: { type: [String], default: [] }, // TEMPORARY: Array for migration
    length: { type: Number, required: true },
    price: { type: Number, required: true },
    overview: { type: String }, // Rich HTML content from TipTap (deprecated - use description)
    description: { type: String, default: "" }, // Rich HTML content combining alsoKnownAs + overview
    objectives: { type: [String], default: [] },
    contact: { type: String },
    buttonLabel: { type: String },
    image: { type: String },
    reasons: { type: [String], default: [] },
  },
  { collection: "drivingclasses", timestamps: true }
);

export default mongoose.models.Classes ||
  mongoose.model("Classes", ClassSchema);
