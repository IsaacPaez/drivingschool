import mongoose, { Schema, Document } from "mongoose";

// Nueva estructura de slot/planning según MongoDB
export interface ScheduleSlot {
  _id?: string; // Allow custom string IDs
  date: string; // '2025-05-15'
  start: string; // '10:00' 
  end: string; // '10:30'
  booked: boolean;
  studentId: string | null; // Changed to string to support custom IDs
  status: 'free' | 'scheduled' | 'cancelled' | 'available' | 'pending' | 'booked';
  classType?: string; // 'driving_test', 'lesson', etc.
  pickupLocation?: string;
  dropoffLocation?: string;
  selectedProduct?: string;
  studentName?: string;
  paid?: boolean;
  amount?: number;
  paymentMethod?: string;
  reservedAt?: Date;
}

export interface IInstructor extends Document {
  name: string;
  photo: string;
  email: string;
  password: string;
  certifications?: string;
  experience?: string;
  dni?: string;
  canTeachTicketClass?: boolean;
  canTeachDrivingTest?: boolean;
  canTeachDrivingLesson?: boolean;
  schedule?: ScheduleSlot[];
  schedule_driving_test?: ScheduleSlot[];
  schedule_driving_lesson?: ScheduleSlot[];
}

const ScheduleSlotSchema = new Schema<ScheduleSlot>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() }, // Allow custom string IDs
  date: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  booked: { type: Boolean, default: false },
  studentId: { type: String, default: null }, // Changed to String to support custom IDs
  status: { type: String, enum: ['free', 'scheduled', 'cancelled', 'available', 'pending', 'booked'], default: 'free' },
  classType: { type: String, default: 'lesson' }, // Nuevo campo para el tipo de clase
  pickupLocation: { type: String, default: '' },
  dropoffLocation: { type: String, default: '' },
  selectedProduct: { type: String, default: '' },
  studentName: { type: String, default: '' },
  paid: { type: Boolean, default: false },
  amount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'instructor' },
  reservedAt: { type: Date, default: null },
});

const InstructorSchema = new Schema<IInstructor>(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    photo: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    certifications: { type: String, default: "N/A" },
    experience: { type: String, default: "N/A" },
    dni: { type: String },
    canTeachTicketClass: { type: Boolean, default: false },
    canTeachDrivingTest: { type: Boolean, default: false },
    canTeachDrivingLesson: { type: Boolean, default: false },
    schedule: [ScheduleSlotSchema],
    schedule_driving_test: [ScheduleSlotSchema],
    schedule_driving_lesson: [ScheduleSlotSchema],
  },
  { timestamps: true }
);

// 🔹 Importante: Asegurar que el modelo siempre se registre correctamente
const Instructor = mongoose.models.Instructor || mongoose.model<IInstructor>("Instructor", InstructorSchema);
export default Instructor;
