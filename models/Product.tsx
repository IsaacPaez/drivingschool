import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  buttonLabel: String,
}, { collection: "products" }); // Asegurarse de que está en minúsculas

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
