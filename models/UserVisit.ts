import mongoose, { Schema, Document } from 'mongoose';

export interface IUserVisit extends Document {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  pageUrl: string;
  referrer: string;
  timestamp: Date;
  duration: number;
  geolocation: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
}

const UserVisitSchema = new Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  pageUrl: { type: String, required: true },
  referrer: { type: String },
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number, default: 0 },
  geolocation: {
    country: String,
    city: String,
    latitude: Number,
    longitude: Number
  }
});

export default mongoose.models.UserVisit || mongoose.model<IUserVisit>('UserVisit', UserVisitSchema); 