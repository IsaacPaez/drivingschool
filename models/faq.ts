import mongoose, { Schema, Document, models, model } from "mongoose";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQDocument extends Document {
  drivingLessons: FAQItem[];
  advancedDrivingImprovementCourse: FAQItem[];
}

const FAQItemSchema = new Schema<FAQItem>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const FAQSchema = new Schema<FAQDocument>({
  drivingLessons: { type: [FAQItemSchema], default: [] },
  advancedDrivingImprovementCourse: { type: [FAQItemSchema], default: [] },
});

export default models.FAQ || model<FAQDocument>("FAQ", FAQSchema, "faq"); 