import mongoose, { Schema, Document } from "mongoose";

interface Slot {
  start: string;
  end: string;
}

interface Schedule {
  date: string;
  slots: Slot[];
}

interface IInstructor extends Document {
  name: string;
  photo: string;
  certifications: string;
  experience: string;
  schedule: Schedule[];
}

const SlotSchema = new Schema<Slot>({
  start: { type: String, required: true },
  end: { type: String, required: true },
});

const ScheduleSchema = new Schema<Schedule>({
  date: { type: String, required: true },
  slots: [SlotSchema],
});

const InstructorSchema = new Schema<IInstructor>(
  {
    name: { type: String, required: true },
    photo: { type: String, required: true },
    certifications: { type: String, default: "N/A" },
    experience: { type: String, default: "N/A" },
    schedule: [ScheduleSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Instructor || mongoose.model<IInstructor>("Instructor", InstructorSchema);
