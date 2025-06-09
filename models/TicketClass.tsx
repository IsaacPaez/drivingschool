import mongoose, { Schema, Document } from "mongoose";

export interface ITicketClass extends Document {
  locationId: mongoose.Schema.Types.ObjectId;
  date: Date;
  hour: string;
  classId: mongoose.Schema.Types.ObjectId;
  type: string;
  duration: string;
  instructorId: mongoose.Schema.Types.ObjectId;
  students: {
    studentId: mongoose.Schema.Types.ObjectId;
    reason?: string;
    citation_number?: string;
    citation_ticket?: string;
    course_country?: string;
  }[];
}

const TicketClassSchema = new Schema<ITicketClass>(
  {
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    date: { type: Date, required: true },
    hour: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "DrivingClass", required: true },
    type: { type: String, required: true },
    duration: { type: String, required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
    students: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        reason: { type: String },
        citation_number: { type: String },
        citation_ticket: { type: String },
        course_country: { type: String },
      }
    ],
  },
  { timestamps: true }
);

const TicketClass = mongoose.models.TicketClass || mongoose.model<ITicketClass>("TicketClass", TicketClassSchema);
export default TicketClass; 