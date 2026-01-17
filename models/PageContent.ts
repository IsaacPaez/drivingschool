import mongoose, { Schema, Document, Model } from "mongoose";

// Interfaces
export interface IStatistic {
  value: number;
  label: string;
  suffix: string;
}

export interface ICtaButton {
  text: string;
  link: string;
  actionType: "link" | "modal";
  modalType?: "service-selector" | "custom";
  order: number;
}

export interface ITitleConfig {
  part1: string;
  part2: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
}

export interface IBenefitsTitleConfig {
  text: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
}

export interface IDrivingLessonsTitleConfig {
  text: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
}

export interface ITrafficCourseCard {
  title: string;
  items: string[];
  ctaText: string;
  ctaLink: string;
  order: number;
}

export interface ITrafficCoursesSection {
  title: {
    text: string;
    gradientFrom: string;
    gradientTo: string;
  };
  backgroundImage: string;
  cards: ITrafficCourseCard[];
}

export interface IAreasWeServeConfig {
  title: string;
  description: string;
}

export interface IBackgroundImage {
  mobile: string;
  desktop: string;
}

export interface IFeatureSection {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export interface IBenefitItem {
  image: string;
  title: string;
  description: string;
  link?: string;
  order: number;
}

export interface IBenefitsSection {
  title: IBenefitsTitleConfig;
  items: IBenefitItem[];
}

export interface IPageContent extends Document {
  pageType: "home" | "about" | "services" | "contact" | "custom";
  title: ITitleConfig;
  description: string;
  statistics: IStatistic[];
  ctaButtons: ICtaButton[];
  backgroundImage: IBackgroundImage;
  featureSection?: IFeatureSection;
  benefitsSection?: IBenefitsSection;
  drivingLessonsTitle?: IDrivingLessonsTitleConfig;
  trafficCoursesSection?: ITrafficCoursesSection;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const StatisticSchema = new Schema<IStatistic>(
  {
    value: { type: Number, required: true, min: 0 },
    label: { type: String, required: true, trim: true, maxlength: 50 },
    suffix: { type: String, default: "+", maxlength: 5 },
  },
  { _id: false }
);

const CtaButtonSchema = new Schema<ICtaButton>(
  {
    text: { type: String, required: true, trim: true, maxlength: 100 },
    link: { type: String, required: true, trim: true },
    actionType: { type: String, enum: ["link", "modal"], default: "link" },
    modalType: { type: String, enum: ["service-selector", "custom"], required: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const TitleConfigSchema = new Schema<ITitleConfig>(
  {
    part1: { type: String, required: true, trim: true, maxlength: 200 },
    part2: { type: String, required: true, trim: true, maxlength: 200 },
    gradientFrom: { type: String, default: "#4CAF50" },
    gradientVia: { type: String, default: "#43e97b" },
    gradientTo: { type: String, default: "#38f9d7" },
  },
  { _id: false }
);

const BenefitsTitleConfigSchema = new Schema<IBenefitsTitleConfig>(
  {
    text: { type: String, required: true, trim: true, maxlength: 200 },
    gradientFrom: { type: String, default: "#27ae60" },
    gradientVia: { type: String, default: "#000000" },
    gradientTo: { type: String, default: "#0056b3" },
  },
  { _id: false }
);

const DrivingLessonsTitleConfigSchema = new Schema<IDrivingLessonsTitleConfig>(
  {
    text: { type: String, required: true, trim: true, maxlength: 200 },
    gradientFrom: { type: String, default: "#27ae60" },
    gradientVia: { type: String, default: "#000000" },
    gradientTo: { type: String, default: "#0056b3" },
  },
  { _id: false }
);

const TrafficCourseCardSchema = new Schema<ITrafficCourseCard>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    items: { type: [String], default: [] },
    ctaText: { type: String, required: true, trim: true, maxlength: 50 },
    ctaLink: { type: String, required: true, trim: true },
    order: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const TrafficCoursesSectionSchema = new Schema<ITrafficCoursesSection>(
  {
    title: {
      text: { type: String, required: true, trim: true, maxlength: 100 },
      gradientFrom: { type: String, default: "#27ae60" },
      gradientTo: { type: String, default: "#ffffff" },
    },
    backgroundImage: { type: String, required: true },
    cards: { type: [TrafficCourseCardSchema], default: [] },
  },
  { _id: false }
);

const AreasWeServeConfigSchema = new Schema<IAreasWeServeConfig>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const BackgroundImageSchema = new Schema<IBackgroundImage>(
  {
    mobile: { type: String, required: true },
    desktop: { type: String, required: true },
  },
  { _id: false }
);

const FeatureSectionSchema = new Schema<IFeatureSection>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    subtitle: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    image: { type: String, required: true },
  },
  { _id: false }
);

const BenefitItemSchema = new Schema<IBenefitItem>(
  {
    image: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    link: { type: String, required: false, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const BenefitsSectionSchema = new Schema<IBenefitsSection>(
  {
    title: { type: BenefitsTitleConfigSchema, required: true },
    items: {
      type: [BenefitItemSchema],
      default: [],
      validate: {
        validator: (arr: IBenefitItem[]) => arr.length <= 10,
        message: "Maximum 10 benefit items allowed",
      },
    },
  },
  { _id: false }
);

const PageContentSchema: Schema = new Schema(
  {
    pageType: {
      type: String,
      enum: ["home", "about", "services", "contact", "custom"],
      required: true,
      index: true,
    },
    title: { type: TitleConfigSchema, required: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    statistics: {
      type: [StatisticSchema],
      default: [],
      validate: {
        validator: (arr: IStatistic[]) => arr.length <= 10,
        message: "Maximum 10 statistics allowed",
      },
    },
    ctaButtons: {
      type: [CtaButtonSchema],
      default: [],
      validate: {
        validator: (arr: ICtaButton[]) => arr.length <= 5,
        message: "Maximum 5 CTA buttons allowed",
      },
    },
    backgroundImage: { type: BackgroundImageSchema, required: true },
    featureSection: { type: FeatureSectionSchema, required: false },
    benefitsSection: { type: BenefitsSectionSchema, required: false },
    drivingLessonsTitle: { type: DrivingLessonsTitleConfigSchema, required: false },
    trafficCoursesSection: { type: TrafficCoursesSectionSchema, required: false },
    areasWeServe: { type: AreasWeServeConfigSchema, required: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PageContentSchema.index({ pageType: 1, isActive: 1, order: 1 });

// Eliminar el modelo si ya existe para forzar la recreación con el nuevo schema
if (mongoose.models.PageContent) {
  delete mongoose.models.PageContent;
}

const PageContent: Model<IPageContent> =
  mongoose.model<IPageContent>("PageContent", PageContentSchema);

export default PageContent;
