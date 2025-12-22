import mongoose, { Schema, Document } from "mongoose";

interface ILocation extends Document {
  title: string;
  slug?: string;
  description: string;
  zone: string;
  locationImage: string;
  content?: string; // Contenido rico en HTML
  instructors: mongoose.Types.ObjectId[]; // Usamos ObjectId en lugar de objetos anidados
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true }, // 🔹 Slug para URLs SEO-friendly
    description: { type: String, required: true },
    zone: { type: String, required: true },
    locationImage: { type: String, required: true },
    content: { type: String, default: "" }, // 🔹 Contenido rico en HTML
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Instructor" }] // 🔹 Referencia a Instructor
  },
  { timestamps: true }
);

// 🔹 Asegurar que el modelo siempre se registre correctamente
const Location = mongoose.models.Location || mongoose.model<ILocation>("Location", LocationSchema);
export default Location;
