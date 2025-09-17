"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  price: number;
  buttonLabel?: string;
  media?: string[];
  type: "buy" | "book";
}

const DrivingLessons = ({ category }: { category: string }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`/api/products?category=${category}`);
        const data = await response.json();
        setLessons(data);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      }
    };

    fetchLessons();
  }, [category]);

  return (
    <section className="bg-white py-6 px-4">
      <div className="max-w-6xl mx-auto" style={{maxWidth: '1500px'}}>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-[#000000] leading-tight mb-10 py-2">
          <span className="text-[#27ae60]">OUR</span>{" "}
          <span className="text-[#000000]">DRIVING</span>{" "}
          <span className="text-[#0056b3]">LESSONS</span>
        </h2>
        <div className="px-2 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-4 xl:gap-5 justify-items-center">
            {lessons.map((lesson) => {
              const isBooking = lesson.buttonLabel?.toLowerCase().includes("book");
              return (
                <div
                  key={lesson._id}
                  className="relative w-full max-w-[320px] sm:max-w-[340px] min-h-[400px] bg-white rounded-2xl border-2 border-[#0056b3] shadow-lg flex flex-col items-center px-5 py-6 group transition-transform duration-300 hover:-translate-y-3 hover:shadow-2xl"
                >
                  {/* Banda Best Seller */}
                  {lesson.title?.toLowerCase().includes("pack") && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#27ae60] text-white text-xs font-bold px-3 py-1 rounded-full shadow z-20 border-2 border-white whitespace-nowrap">Best Seller</span>
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
                    onClick={() => {}}
                  >
                    {lesson.buttonLabel || (isBooking ? "Book now!" : "Add to Cart")}
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