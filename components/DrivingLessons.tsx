"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePageContent } from "@/hooks/usePageContent";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  price: number;
  buttonLabel?: string;
  media?: string[];
  tag?: string;
  type: "buy" | "book";
  redirectUrl?: string;
}

const DrivingLessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  // Obtener contenido dinámico del dashboard
  const { content } = usePageContent({ pageType: "home" });

  // Valores por defecto para el título
  const defaultTitle = {
    text: "OUR DRIVING LESSONS",
    gradientFrom: "#27ae60",
    gradientVia: "#000000",
    gradientTo: "#0056b3",
  };

  // Usar contenido dinámico si está disponible, sino usar default
  const titleConfig = content?.drivingLessonsTitle || defaultTitle;

  const handleButtonClick = (lesson: Lesson) => {
    try {
      // Si hay redirectUrl, usarlo primero
      if (lesson.redirectUrl) {
        console.log(`Custom redirect URL detected: ${lesson.redirectUrl}`);
        
        // Si es una URL externa
        if (lesson.redirectUrl.startsWith('http://') || lesson.redirectUrl.startsWith('https://')) {
          window.location.href = lesson.redirectUrl;
          return;
        }
        
        // Si es una ruta interna
        window.location.href = lesson.redirectUrl;
        return;
      }
      
      // Comportamiento por defecto: guardar en localStorage y redirigir a /driving-lessons
      localStorage.setItem('selectedPackage', JSON.stringify({
        id: lesson._id,
        title: lesson.title
      }));

      console.log(`Button clicked for: ${lesson.title}, redirecting to /driving-lessons`);

      // All driving lessons redirect to the booking page
      window.location.href = '/driving-lessons';
    } catch (error) {
      console.error('Error handling button click:', error);
    }
  };

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setLessons(data);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      }
    };

    fetchLessons();
  }, []);

  return (
    <section className="bg-white py-6 px-4">
      <div className="max-w-6xl mx-auto" style={{maxWidth: '1500px'}}>
        <div className="text-center mb-10 py-2">
          <h2 
            className="text-4xl sm:text-5xl font-extrabold leading-tight inline-block"
            style={{
              backgroundImage: `linear-gradient(to right, ${titleConfig.gradientFrom}, ${titleConfig.gradientVia}, ${titleConfig.gradientTo})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {titleConfig.text}
          </h2>
        </div>
        <div className="px-2 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-4 xl:gap-5 justify-items-center">
            {lessons.map((lesson) => {
              return (
                <div
                  key={lesson._id}
                  className="relative w-full max-w-[320px] sm:max-w-[340px] min-h-[400px] bg-white rounded-2xl border-2 border-[#0056b3] shadow-lg flex flex-col items-center px-5 py-6 group transition-transform duration-300 hover:-translate-y-3 hover:shadow-2xl"
                >
                  {/* Banda de Tag (si existe) */}
                  {lesson.tag && lesson.tag.trim() !== "" && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#27ae60] text-white text-xs font-bold px-3 py-1 rounded-full shadow z-20 border-2 border-white whitespace-nowrap uppercase">
                      {lesson.tag}
                    </span>
                  )}
                  {/* Imagen/Icono circular */}
                  <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full border-4 border-[#0056b3] bg-white overflow-hidden shadow-sm flex-shrink-0">
                    {lesson.media && lesson.media.length > 0 ? (
                      <Image
                        src={lesson.media[0]}
                        alt={lesson.title}
                        width={60}
                        height={60}
                        className="object-contain w-14 h-14"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full text-2xl text-[#0056b3] font-bold">
                        {lesson.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* Título */}
                  <h3 className="text-xl font-extrabold text-[#0056b3] text-center mb-2 tracking-wide uppercase leading-tight">
                    {lesson.title}
                  </h3>
                  {/* Precio destacado */}
                  <div className="text-3xl font-extrabold text-[#27ae60] text-center mb-3 flex-shrink-0">
                    ${lesson.price}
                  </div>
                  {/* Descripción */}
                  <p className="text-sm text-gray-700 text-center leading-relaxed mb-4 flex-1 flex items-center justify-center px-2">
                    {lesson.description}
                  </p>
                  {/* Botón ancho */}
                  <button
                    type="button"
                    className="w-full bg-[#0056b3] text-white font-extrabold text-sm py-3 px-4 rounded-full shadow-md hover:bg-[#27ae60] hover:shadow-lg transition-all duration-200 active:scale-95 border-none flex-shrink-0 min-h-[48px] flex items-center justify-center"
                    onClick={() => handleButtonClick(lesson)}
                  >
                    {lesson.buttonLabel || "Book now!"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DrivingLessons;