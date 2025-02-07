import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    media: { type: [String], default: [] }, // Array de URLs de imágenes o videos
    price: { type: Number, required: true },
    category: { type: String, default: "General" }, // Ejemplo: "General", "Auto", etc.
    type: { type: String, default: "Buy" }, // Tipo de paquete (por ejemplo, "Buy" o "Rent")
    buttonLabel: { type: String, default: "Add to Cart" }, // Texto del botón
  },
  { collection: "packages", timestamps: true } // timestamps agrega `createdAt` y `updatedAt`
);

export default mongoose.models.Packages || mongoose.model("Packages", PackageSchema);
