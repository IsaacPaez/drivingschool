import mongoose, { Schema, Document } from "mongoose";

interface Slot {
  start: string;
  end: string;
  status: 'free' | 'scheduled' | 'cancelled';
  booked: boolean;
  studentId: mongoose.Schema.Types.ObjectId | null;
}

interface Schedule {
  date: string;
  slots: Slot[];
}

export interface IInstructor extends Document {
  name: string;
  photo: string;
  certifications?: string;
  experience?: string;
  schedule?: Schedule[];
}

const SlotSchema = new Schema<Slot>({
  start: { type: String, required: true },
  end: { type: String, required: true },
  status: { type: String, enum: ['free', 'scheduled', 'cancelled'], default: 'free' },
  booked: { type: Boolean, default: false },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

const ScheduleSchema = new Schema<Schedule>({
  date: { type: String, required: true },
  slots: [SlotSchema],
});

const InstructorSchema = new Schema<IInstructor>(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    photo: { type: String, required: true },
    certifications: { type: String, default: "N/A" },
    experience: { type: String, default: "N/A" },
    schedule: [ScheduleSchema],
  },
  { timestamps: true }
);

// 🔹 Importante: Asegurar que el modelo siempre se registre correctamente
const Instructor = mongoose.models.Instructor || mongoose.model<IInstructor>("Instructor", InstructorSchema);
export default Instructor;
