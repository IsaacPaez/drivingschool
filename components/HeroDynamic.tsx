"use client";

import React, { useState } from "react";
import Link from "next/link";
import BookNowModal from "./BookNowModal";
import Image from "next/image";
import AnimatedCounter from "./AnimatedCounter";
import { usePageContent } from "@/hooks/usePageContent";

/**
 * Hero Component con contenido dinámico
 * 
 * Este componente obtiene el contenido desde el dashboard y lo muestra.
 * Si no hay contenido disponible, usa valores hardcodeados como fallback.
 * 
 * Para usar esta versión:
 * 1. Renombrar Hero.tsx a Hero.old.tsx
 * 2. Renombrar este archivo de HeroDynamic.tsx a Hero.tsx
 * 3. Asegurarse de que NEXT_PUBLIC_DASHBOARD_API_URL esté configurado en .env
 */
const HeroDynamic = () => {
  const [modalOpen, setModalOpen] = useState(false);
  
  // Obtener contenido dinámico del dashboard
  const { content, loading } = usePageContent({
    pageType: "home",
  });

  // Valores por defecto (fallback)
  const defaultContent = {
    title: {
      part1: "Learn To Drive",
      part2: "Safely For Life",
      gradientFrom: "#4CAF50",
      gradientVia: "#43e97b",
      gradientTo: "#38f9d7",
    },
    description:
      "Affordable Driving School offers professional Behind the Wheel Driving Lessons and Traffic School Courses in Palm Beach County.",
    statistics: [
      { value: 9000, label: "Students", suffix: "+" },
      { value: 5000, label: "Lessons", suffix: "+" },
      { value: 30, label: "Years of Experience", suffix: "+" },
    ],
    ctaButtons: [
      { text: "Book Driving Lessons", link: "/lessons", actionType: "modal" as const, modalType: "service-selector" as const, order: 0 },
      { text: "Book a Traffic Ticket Class", link: "/classes", actionType: "link" as const, order: 1 },
    ],
    backgroundImage: {
      mobile:
        "https://res.cloudinary.com/dzi2p0pqa/image/upload/f_auto,q_auto,w_1080/v1761582232/p9kxi89spkqsfsjc2yfj.jpg",
      desktop:
        "https://res.cloudinary.com/dzi2p0pqa/image/upload/f_auto,q_auto,w_1920/v1761582177/rxcp45fmxz7e0uec2qyv.jpg",
    },
  };

  // Usar contenido dinámico si está disponible, sino usar default
  const displayContent = content || defaultContent;

  // Ordenar botones CTA por orden
  const sortedButtons = [...displayContent.ctaButtons].sort((a, b) => a.order - b.order);

  return (
    <section className="relative min-h-[100vh] flex items-center justify-start px-4 sm:px-6 md:px-12 pt-20 sm:pt-16 md:pt-8 lg:pt-0 overflow-hidden">
      {/* Imagen de fondo para móvil */}
      <Image
        src={displayContent.backgroundImage.mobile}
        alt={`${displayContent.title.part1} ${displayContent.title.part2}`}
        fill
        priority
        quality={85}
        sizes="(max-width: 640px) 100vw, 0vw"
        className="object-cover object-center sm:hidden"
      />

      {/* Imagen de fondo para desktop */}
      <Image
        src={displayContent.backgroundImage.desktop}
        alt={`${displayContent.title.part1} ${displayContent.title.part2}`}
        fill
        priority
        quality={85}
        sizes="(min-width: 641px) 100vw, 0vw"
        className="object-cover object-center hidden sm:block"
      />

      {/* Fondo degradado oscuro */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-transparent z-10" />

      {/* Contenido principal */}
      <div
        className="relative max-w-6xl mx-auto flex flex-col items-start text-left w-full z-20 py-4 sm:py-6 md:py-8 lg:py-10"
        style={{ maxWidth: "1500px" }}
      >
        {/* Hero Text */}
        <div className="w-full max-w-xl mb-6 sm:mb-8 mt-4 sm:mt-8 md:mt-12 lg:mt-16">
          <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 rounded-xl shadow-2xl animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 sm:mb-6 drop-shadow-2xl transition-all duration-500">
              <span
                className="block bg-clip-text text-transparent animate-gradient-x"
                style={{
                  backgroundImage: `linear-gradient(to right, ${displayContent.title.gradientFrom}, ${displayContent.title.gradientVia}, ${displayContent.title.gradientTo})`,
                }}
              >
                {displayContent.title.part1}
              </span>
              <span className="block mt-1 sm:mt-2">{displayContent.title.part2}</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium mb-0 w-full max-w-xl drop-shadow-lg transition-all duration-500">
              {displayContent.description}
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-white/30 backdrop-blur-sm shadow-lg rounded-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 mb-6 sm:mb-8 md:mb-12 w-full max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
            {displayContent.statistics.map((stat, index) => (
              <div key={index}>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
                  <AnimatedCounter
                    end={stat.value}
                    duration={2500 - index * 300}
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-black"
                  />
                  <span
                    className="text-[#4CAF50]"
                    style={{ color: displayContent.title.gradientFrom }}
                  >
                    {stat.suffix}
                  </span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-black">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botones CTA */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xl mb-8 sm:mb-12 md:mb-16">
          {sortedButtons.map((button, index) => {
            if (button.actionType === "modal") {
              return (
                <button
                  key={index}
                  type="button"
                  aria-label={button.text}
                  onClick={() => setModalOpen(true)}
                  className="bg-[#4CAF50] text-white text-base sm:text-lg md:text-xl px-4 sm:px-6 py-3 sm:py-4 rounded-full border-white hover:bg-[#0056b3] text-center transition-all shadow-lg hover:shadow-xl"
                >
                  {button.text}
                </button>
              );
            }

            return (
              <Link
                key={index}
                href={button.link}
                className="bg-[#4CAF50] text-white text-base sm:text-lg md:text-xl px-4 sm:px-6 py-3 sm:py-4 rounded-full border-white hover:bg-[#0056b3] text-center transition-all shadow-lg hover:shadow-xl"
              >
                {button.text}
              </Link>
            );
          })}
        </div>

        {/* Modal */}
        <BookNowModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>

      {/* Indicador de carga (opcional) */}
      {loading && (
        <div className="absolute top-4 right-4 z-50 bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
          Loading...
        </div>
      )}
    </section>
  );
};

export default HeroDynamic;
