import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  buttonLabel: { type: String, default: "Buy Now" },
  media: { type: [String], default: [] },
});

const Collection = mongoose.models.Collection || mongoose.model("Collection", CollectionSchema);

export default Collection;
