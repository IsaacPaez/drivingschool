import mongoose, { Schema, Document } from "mongoose";

export interface ITicketClass extends Document {
  locationId: mongoose.Schema.Types.ObjectId;
  date: Date;
  hour: string;
  endhour?: string;
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
  cupos: number;
}

const TicketClassSchema = new Schema<ITicketClass>(
  {
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    date: { type: Date, required: true },
    hour: { type: String, required: true },
    endhour: { type: String, required: false },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Classes", required: true },
    type: { type: String, required: true },
    duration: { type: String, required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
    students: [
      {
        type: mongoose.Schema.Types.Mixed,
        required: false
      }
    ],
    cupos: { type: Number, required: true },
  },
  { collection: "ticketclasses", timestamps: true }
);

const TicketClass = mongoose.models.TicketClass || mongoose.model<ITicketClass>("TicketClass", TicketClassSchema);
export default TicketClass; 