"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePageContent } from "@/hooks/usePageContent";

const TrafficCourses = () => {
  const router = useRouter();
  const { content } = usePageContent({ pageType: "home" });

  // Valores por defecto si no hay datos del dashboard
  const trafficCoursesData = content?.trafficCoursesSection || {
    title: {
      text: "TRAFFIC COURSES",
      gradientFrom: "#27ae60",
      gradientTo: "#ffffff",
    },
    backgroundImage: "https://res.cloudinary.com/dzi2p0pqa/image/upload/v1761583725/lobuiox0sri4ujsdmgaf.jpg",
    cards: [
      {
        title: "Live Classroom",
        items: [
          "Learn with Professional Instruction",
          "Course for first-time drivers",
          "Advanced driving improvement",
          "Insurance discounts for seniors",
          "And more!",
        ],
        ctaText: "View Courses",
        ctaLink: "/classes",
        order: 0,
      },
      {
        title: "Online Learning",
        items: [
          "Learn from the Comfort of Your Home",
          "Course for first-time drivers",
          "Advanced driving improvement",
          "Insurance discounts for seniors",
          "And more!",
        ],
        ctaText: "View Online Courses",
        ctaLink: "/online-courses",
        order: 1,
      },
    ],
  };

  // Ordenar las cards por el campo order
  const sortedCards = [...trafficCoursesData.cards].sort((a, b) => a.order - b.order);

  // Función para dividir el título en palabras coloreadas
  const renderTitle = () => {
    const words = trafficCoursesData.title.text.split(" ");
    const halfIndex = Math.ceil(words.length / 2);
    
    const firstHalf = words.slice(0, halfIndex).join(" ");
    const secondHalf = words.slice(halfIndex).join(" ");

    return (
      <>
        <span 
          className="inline-block"
          style={{
            backgroundImage: `linear-gradient(to right, ${trafficCoursesData.title.gradientFrom}, ${trafficCoursesData.title.gradientTo})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {firstHalf}
        </span>
        {" "}
        <span className="text-white">{secondHalf}</span>
      </>
    );
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <section
      className="bg-cover bg-center py-12 relative"
      style={{ backgroundImage: `url('${trafficCoursesData.backgroundImage}')` }}
    >
      {/* Capa oscura para mejorar contraste */}
      <div className="absolute inset-0 bg-black bg-opacity-35 z-0"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-6" style={{maxWidth: '1500px'}}>
        <h2 className="text-5xl sm:text-6xl font-extrabold text-center leading-tight mb-12" style={{letterSpacing: '1px'}}>
          {renderTitle()}
        </h2>
        
        {/* Grid con justify-center para centrar las cards */}
        <div className="flex flex-wrap justify-center gap-8 mx-auto">
          {sortedCards.map((course, index) => (
            <div
              key={index}
              className="bg-black bg-opacity-50 shadow-lg p-8 transform transition-transform duration-300 hover:-translate-y-2 flex flex-col"
              style={{
                borderRadius: "15px",
                width: "100%",
                maxWidth: sortedCards.length === 1 ? "600px" : sortedCards.length === 2 ? "45%" : sortedCards.length === 3 ? "30%" : "23%",
                minHeight: "400px",
              }}
            >
              <h3 className="text-2xl font-bold text-white mb-4 text-center">
                {course.title}
              </h3>
              
              {/* Lista con flex-grow para empujar el botón hacia abajo */}
              <ul className="text-gray-300 text-center space-y-2 flex-grow mb-6">
                {course.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              
              {/* Botón siempre al final */}
              <button
                onClick={() => handleNavigation(course.ctaLink)}
                className="bg-[#27ae60] hover:bg-[#0056b3] text-white font-bold text-lg py-3 px-6 rounded-full transition-colors duration-300 w-full mt-auto"
              >
                {course.ctaText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrafficCourses;
