import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  dni: string;
  ssnLast4: string;
  hasLicense: boolean;
  licenseNumber?: string;
  birthDate: string;
  streetAddress: string;
  apartmentNumber?: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  sex: string;
  password: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
  privateNotes?: string;
  photo?: string;
  classReminder?: boolean;
  drivingTestReminder?: boolean;
  cart?: any[]; // Cart items for driving lessons
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  middleName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  dni: { type: String, required: true },
  ssnLast4: { type: String, required: true },
  hasLicense: { type: Boolean, required: true },
  licenseNumber: { type: String },
  birthDate: { type: String, required: true },
  streetAddress: { type: String, required: true },
  apartmentNumber: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  sex: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  privateNotes: { type: String },
  photo: { type: String },
  classReminder: { type: Boolean, default: false },
  drivingTestReminder: { type: Boolean, default: false },
  cart: { type: [Schema.Types.Mixed], default: [] }, // Cart items for driving lessons
});

// Add virtual for full name
UserSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Ensure virtuals are included when converting to JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User; 