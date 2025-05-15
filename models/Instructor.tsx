import mongoose, { Schema, Document } from "mongoose";

// Nueva estructura de slot/planning según MongoDB
export interface ScheduleSlot {
  date: string; // '2025-05-15'
  start: string; // '10:00'
  end: string; // '10:30'
  booked: boolean;
  studentId: mongoose.Schema.Types.ObjectId | null;
  status: 'free' | 'scheduled' | 'cancelled';
}

export interface IInstructor extends Document {
  name: string;
  photo: string;
  email: string;
  certifications?: string;
  experience?: string;
  schedule?: ScheduleSlot[];
}

const ScheduleSlotSchema = new Schema<ScheduleSlot>({
  date: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  booked: { type: Boolean, default: false },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['free', 'scheduled', 'cancelled'], default: 'free' },
});

const InstructorSchema = new Schema<IInstructor>(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    photo: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    certifications: { type: String, default: "N/A" },
    experience: { type: String, default: "N/A" },
    schedule: [ScheduleSlotSchema],
  },
  { timestamps: true }
);

// 🔹 Importante: Asegurar que el modelo siempre se registre correctamente
const Instructor = mongoose.models.Instructor || mongoose.model<IInstructor>("Instructor", InstructorSchema);
export default Instructor;
