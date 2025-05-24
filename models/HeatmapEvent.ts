import mongoose, { Schema, Document } from 'mongoose';

export interface IHeatmapEvent extends Document {
  userId: string;
  sessionId: string;
  pageUrl: string;
  eventType: 'click' | 'move' | 'scroll';
  x: number;
  y: number;
  timestamp: Date;
  elementId?: string;
  elementClass?: string;
  elementTag?: string;
}

const HeatmapEventSchema = new Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true },
  pageUrl: { type: String, required: true },
  eventType: { 
    type: String, 
    required: true,
    enum: ['click', 'move', 'scroll']
  },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  elementId: String,
  elementClass: String,
  elementTag: String
});

export default mongoose.models.HeatmapEvent || mongoose.model<IHeatmapEvent>('HeatmapEvent', HeatmapEventSchema); 