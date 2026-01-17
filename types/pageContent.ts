// Tipos para el contenido de páginas desde el dashboard
export interface Statistic {
  value: number;
  label: string;
  suffix: string;
}

export interface CtaButton {
  text: string;
  link: string;
  actionType: "link" | "modal";
  modalType?: "service-selector" | "custom";
  order: number;
}

export interface TitleConfig {
  part1: string;
  part2: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
}

export interface BenefitsTitleConfig {
  text: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
}

export interface DrivingLessonsTitleConfig {
  text: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
}

export interface TrafficCourseCard {
  title: string;
  items: string[];
  ctaText: string;
  ctaLink: string;
  order: number;
}

export interface TrafficCoursesSection {
  title: {
    text: string;
    gradientFrom: string;
    gradientTo: string;
  };
  backgroundImage: string;
  cards: TrafficCourseCard[];
}

export interface BackgroundImage {
  mobile: string;
  desktop: string;
}

export interface FeatureSection {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export interface BenefitItem {
  image: string;
  title: string;
  description: string;
  link?: string;
  order: number;
}

export interface BenefitsSection {
  title: BenefitsTitleConfig;
  items: BenefitItem[];
}

export type PageType = "home" | "about" | "services" | "contact" | "custom";

export interface PageContent {
  _id: string;
  pageType: PageType;
  title: TitleConfig;
  description: string;
  statistics: Statistic[];
  ctaButtons: CtaButton[];
  backgroundImage: BackgroundImage;
  featureSection?: FeatureSection;
  benefitsSection?: BenefitsSection;
  drivingLessonsTitle?: DrivingLessonsTitleConfig;
  trafficCoursesSection?: TrafficCoursesSection;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
