import mongoose, { Schema, models, model } from 'mongoose';

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      id: { type: String, required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    }
  ],
  total: { type: Number, required: true },
  estado: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  orderNumber: { type: Number },
});

export default models.Order || model('Order', OrderSchema); 