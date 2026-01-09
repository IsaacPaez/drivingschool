"use client";

import Image from "next/image";
import { FeatureSection as FeatureSectionType } from "@/types/pageContent";

interface FeatureSectionProps {
  featureSection: FeatureSectionType;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ featureSection }) => {
  const { title, subtitle, description, image } = featureSection;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                <span className="text-green-600">BBB</span> {title.replace("BBB", "")}
              </h2>
              <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">
                {subtitle}
              </p>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              {description}
            </p>
          </div>

          {/* Right: Image */}
          <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-xl">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
