import mongoose, { Schema, Document } from 'mongoose';

export interface IGmailTemplate extends Document {
  name: string;
  type: string;
  subject: string;
  body: string;
}

const GmailTemplateSchema = new Schema<IGmailTemplate>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
});

const GmailTemplate = mongoose.models.GmailTemplate || mongoose.model<IGmailTemplate>('GmailTemplate', GmailTemplateSchema);
export default GmailTemplate; 