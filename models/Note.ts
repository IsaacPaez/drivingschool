import mongoose, { Schema, Document } from "mongoose";

export interface INoteEntry {
  text: string;
  date: Date;
}

export interface INote extends Document {
  studentId: mongoose.Schema.Types.ObjectId;
  instructorId: mongoose.Schema.Types.ObjectId;
  notes: INoteEntry[];
  createdAt?: Date;
  updatedAt?: Date;
}

const NoteEntrySchema = new Schema<INoteEntry>({
  text: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
}, { _id: false });

const NoteSchema = new Schema<INote>({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
  notes: { type: [NoteEntrySchema], default: [] },
}, { timestamps: true });

const Note = mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
export default Note; 