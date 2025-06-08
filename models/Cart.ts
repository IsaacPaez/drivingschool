import mongoose, { Schema, Document, Types } from "mongoose";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

export interface CartDocument extends Document {
  userId: Types.ObjectId;
  items: CartItem[];
  updatedAt: Date;
}

const CartSchema = new Schema<CartDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [
    {
      id: { type: String, required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

CartSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Cart || mongoose.model<CartDocument>("Cart", CartSchema); 