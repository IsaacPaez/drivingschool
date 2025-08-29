import mongoose, { Schema, models, model } from 'mongoose';

// Schema for individual slots/appointments in the order
const OrderSlotSchema = new Schema({
  slotId: { type: String, required: true },
  instructorId: { type: String, required: true },
  instructorName: { type: String, required: true },
  date: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  classType: { type: String, required: true }, // 'driving_test', 'driving_lesson'
  amount: { type: Number, required: true },
  status: { type: String, default: 'pending' }, // 'pending', 'confirmed', 'cancelled'
});

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  
  // Type of order
  orderType: { type: String, required: true }, // 'driving_test', 'driving_lesson_package'
  
  // Original cart items (for backward compatibility)
  items: [
    {
      id: { type: String, required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    }
  ],
  
  // Detailed appointment/slot information
  appointments: [OrderSlotSchema],
  
  // For driving lesson packages
  packageDetails: {
    productId: { type: String },
    packageTitle: { type: String },
    packagePrice: { type: Number },
    totalHours: { type: Number },
    selectedHours: { type: Number },
    pickupLocation: { type: String },
    dropoffLocation: { type: String },
  },
  
  // Payment information
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'online' }, // 'online', 'physical'
  paymentStatus: { type: String, default: 'pending' }, // 'pending', 'completed', 'failed'
  
  // Order status
  estado: { type: String, default: 'pending' }, // 'pending', 'confirmed', 'completed', 'cancelled'
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Generate unique order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      // Use this.constructor instead of mongoose.models.Order for better compatibility
      const count = await (this.constructor as any).countDocuments();
      this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
    } catch (error) {
      console.error('Error generating order number:', error);
      // Fallback to just timestamp if count fails
      this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  }
  this.updatedAt = new Date();
  next();
});

export default models.Order || model('Order', OrderSchema); 