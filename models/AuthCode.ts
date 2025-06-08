import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthCode extends Document {
  email: string;
  code: string;
  expires: Date;
  used: boolean;
}

const AuthCodeSchema = new Schema<IAuthCode>({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expires: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.AuthCode || mongoose.model<IAuthCode>('AuthCode', AuthCodeSchema); 