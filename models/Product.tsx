import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    buttonLabel: String,
    tag: String, // Etiqueta decorativa opcional (ej: "OFERTAS", "NUEVO")
    duration: Number, // Campo para las horas del paquete
    media: [String], // Asegura que el array de imágenes sea reconocido
  },
  { collection: "products" }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
