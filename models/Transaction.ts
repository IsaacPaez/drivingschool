import mongoose, { Schema, models, model } from 'mongoose';

const TransactionSchema = new Schema({
  orderId: { type: String, required: true },
  userId: { type: String, required: true },
  orderIdFromApp: { type: String, required: true },
  amount: { type: String, required: true },
  transactionType: { type: String, required: true },
  customerCode: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  status: { type: String, required: true }, // 'PENDING', 'APPROVED', 'FAILED'
  resultMessage: { type: String, required: true },
  rawwebhook: { type: Schema.Types.Mixed },
  approvalCode: { type: String },
  cardNumber: { type: String },
  transactionTime: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default models.Transaction || model('Transaction', TransactionSchema);
