import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordResetCode extends Document {
  email: string;
  code: string;
  expires: Date;
  used: boolean;
}

const PasswordResetCodeSchema = new Schema<IPasswordResetCode>({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expires: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.PasswordResetCode || mongoose.model<IPasswordResetCode>('PasswordResetCode', PasswordResetCodeSchema); 