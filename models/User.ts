import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  authId?: string;
  dni?: string;
  ssnLast4?: string;
  hasLicense?: boolean;
  licenseNumber?: string;
  birthDate?: string;
  streetAddress?: string;
  apartmentNumber?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  sex?: string;
  howDidYouHear?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
  privateNotes: string;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  authId: { type: String },
  dni: { type: String },
  ssnLast4: { type: String },
  hasLicense: { type: Boolean },
  licenseNumber: { type: String },
  birthDate: { type: String },
  streetAddress: { type: String },
  apartmentNumber: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  phoneNumber: { type: String },
  sex: { type: String },
  howDidYouHear: { type: String },
  role: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  privateNotes: { type: String },
});

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User; 