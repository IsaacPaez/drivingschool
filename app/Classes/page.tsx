"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const ClassesPage: React.FC = () => {
  const [classList, setClassList] = useState<Class[]>([]);
  interface Class {
    _id: string;
    title: string;
    alsoKnownAs?: string[];
    image?: string;
    length?: number;
    price?: number;
    overview: string;
    objectives?: string[];
    contact?: string;
    buttonLabel?: string;
  }

  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/classes");
        const data = await res.json();
        setClassList(data.sort((a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title)));

        if (data.length > 0) {
          setSelectedClass(data[0]); // Selecciona la primera clase por defecto
        }
      } catch {}
    };
    fetchClasses();
  }, []);

  const handleScrollToUpcoming = () => {
    const upcomingSection = document.getElementById("upcoming-contact");
    if (upcomingSection) {
      upcomingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="bg-gray-100 pt-[120px] pb-20 px-4 sm:px-6 md:px-12 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row flex-wrap gap-8 mt-10">
        
        {/* 📌 Lista de Clases */}
        <motion.div
          className="w-full md:w-1/4 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 text-center md:text-left">
            Available Classes
          </h2>
          <div className="flex flex-col space-y-2">
            {classList.map((cls) => {
              const isSelected = selectedClass && selectedClass._id === cls._id;
              return (
                <button
                  key={cls._id}
                  onClick={() => setSelectedClass(cls)}
                  className={`w-full text-left py-3 px-5 rounded-lg transition-all duration-200 border text-base sm:text-lg ${
                    isSelected
                      ? "bg-blue-600 text-white font-semibold border-blue-800 shadow-md"
                      : "bg-gray-50 text-gray-800 hover:bg-blue-100 border-gray-200"
                  }`}
                >
                  {cls.title}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 📌 Detalles de la Clase */}
        <motion.div
          className="flex-1 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {selectedClass ? (
            <>
              {/* 📌 Botón para Scrollear */}
              <div className="flex justify-between items-center mb-6">
                <button onClick={handleScrollToUpcoming} className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition text-lg sm:text-xl">
                  {selectedClass.buttonLabel}
                </button>
              </div>
              
              {/* 📌 IMAGEN */}
              {selectedClass.image && (
                <div className="mb-6 flex justify-center">
                  <Image src={selectedClass.image} alt={selectedClass.title} width={800} height={400} className="rounded-lg shadow-lg border border-gray-300 w-full max-h-[300px] object-cover" />
                </div>
              )}

              {/* 📌 TÍTULO */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center md:text-left">
                {selectedClass.title}
              </h1>

              {/* 📌 TAMBIÉN CONOCIDO COMO */}
              {(selectedClass.alsoKnownAs?.length ?? 0) > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Also known as:</h3>
                  <ul className="list-disc pl-5 text-gray-700">
                    {selectedClass.alsoKnownAs?.map((item, index) => (
                      <li key={index} className="mb-1">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 📌 OVERVIEW */}
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed text-justify mb-6">
                <strong className="text-gray-900">Overview:</strong> {selectedClass.overview}
              </p>

              {/* 📌 UPCOMING SECTION */}
              <p id="upcoming-contact" className="text-base sm:text-lg text-gray-700 leading-relaxed mt-6">
                📆 <strong>Upcoming {selectedClass.title}:</strong>
                <br />
                <span className="text-xl font-bold text-blue-600">{selectedClass.contact ?? "No schedule available."}</span>
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-lg text-center">Select a class to view the details.</p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ClassesPage;
