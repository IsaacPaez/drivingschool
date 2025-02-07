import mongoose, { Schema, Document } from "mongoose";

interface IInstructor {
  name: string;
  image: string;
}

interface ILocation extends Document {
  title: string;
  description: string;
  zone: string;
  locationImage: string;
  instructors: IInstructor[]; // Definir correctamente el array de objetos
  createdAt: Date;
  updatedAt: Date;
}

const InstructorSchema: Schema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
});

const LocationSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    zone: { type: String, required: true },
    locationImage: { type: String, required: true },
    instructors: { type: [InstructorSchema], required: true }, // Se usa el esquema definido arriba
  },
  { timestamps: true }
);

export default mongoose.models.Location || mongoose.model<ILocation>("Location", LocationSchema);
