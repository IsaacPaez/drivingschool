import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  clerkId: { type: String, unique: true, required: true }, // ID de Clerk
  email: { type: String, unique: true, required: true },
  name: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" }, // Opcional: Roles de usuario
});

const User = models.User || model("User", UserSchema);
export default User;
