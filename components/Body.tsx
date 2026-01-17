"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePageContent } from "@/hooks/usePageContent";

const Body = () => {
  // Obtener contenido dinámico del dashboard
  const { content, loading } = usePageContent({ pageType: "home" });

  // Valores por defecto (fallback)
  const defaultFeatureSection = {
    title: "Accredited Driving Traffic School",
    subtitle: "With A+ Rating",
    description:
      "Affordable Driving School is your leading Palm Beach provider for driving lessons and Florida state-approved Traffic courses. Affordable Driving Traffic School has been offering In-Person Traffic School Courses, Driving Lessons, Florida Online Traffic School Classes, and Now Zoom Traffic Classes to thousands of satisfied students in the Palm Beach County area since 1995. These courses are taught by Certified and Experienced Professional Instructors to help students improve their driving knowledge and safety.",
    image: "https://res.cloudinary.com/dzi2p0pqa/image/upload/v1761583171/kl2purqpuosna2pmkwbo.jpg",
  };

  // Usar contenido dinámico si está disponible, sino usar default
  const featureSection = content?.featureSection || defaultFeatureSection;

  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-20">
      <div className="mx-auto flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 lg:space-x-4" style={{maxWidth: '1500px'}}>
        {/* Texto alineado y justificado */}
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#000000] mb-3 leading-snug">
            {featureSection.title}
            <br />
            <span className="text-[#0056b3]">{featureSection.subtitle}</span>
          </h2>
          <p className="text-lg text-[#000000] leading-relaxed max-w-xl mx-auto lg:mx-0 text-justify">
            {featureSection.description}
          </p>
        </div>

        {/* Imagen completamente responsive con animación */}
        <motion.div
          className="w-full lg:w-1/2 lg:flex-shrink-0"
          initial={{ opacity: 0, x: 120 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <Image
            src={featureSection.image}
            alt={featureSection.title}
            width={900}
            height={400}
            className="w-full h-[260px] sm:h-[320px] md:h-[340px] lg:h-[360px] xl:h-[400px] object-cover rounded-lg shadow-md transition-all duration-500"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Body;
