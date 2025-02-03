import mongoose, { Schema, Document } from "mongoose";

interface ILocation extends Document {
  title: string;
  description: string;
  zone: string;
  locationImage: string;
  instructors: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    zone: { type: String, required: true },
    locationImage: { type: String, required: true },
    instructors: { type: [String], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Location || mongoose.model<ILocation>("Location", LocationSchema);
