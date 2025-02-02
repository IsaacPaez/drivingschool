"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const ClassesPage: React.FC = () => {
  const [classList, setClassList] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);

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
              {/* 📌 TÍTULO */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center md:text-left">
                {selectedClass.title}
              </h1>

              {/* 📌 TAMBIÉN CONOCIDO COMO */}
              {selectedClass.alsoKnownAs?.length > 0 && (
                <p className="text-base sm:text-lg text-gray-700 mb-2">
                  <strong className="text-gray-900">Also Know Us:</strong> {selectedClass.alsoKnownAs.join(", ")}
                </p>
              )}

              {/* 📌 IMAGEN DE LA CLASE */}
              <div className="mb-6 flex justify-center">
                {selectedClass.image ? (
                  <Image
                    src={selectedClass.image}
                    alt={selectedClass.title}
                    width={800}
                    height={400}
                    className="rounded-lg shadow-lg border border-gray-300 w-full max-h-[300px] object-cover"
                  />
                ) : (
                  <p className="text-gray-500 italic">Error Image.</p>
                )}
              </div>

              {/* 📌 DURACIÓN Y PRECIO */}
              <div className="flex flex-col sm:flex-row sm:items-center mb-6 text-base sm:text-lg">
                {selectedClass.length && (
                  <p className="text-gray-800 flex items-center mb-2 sm:mb-0">
                    ⏳ <strong className="ml-1">Length:</strong> {selectedClass.length} hours
                  </p>
                )}
                {selectedClass.price && (
                  <p className="text-gray-800 sm:ml-6 flex items-center">
                    💰 <strong className="ml-1">Price:</strong> ${selectedClass.price}
                  </p>
                )}
              </div>

              {/* 📌 DESCRIPCIÓN */}
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                <strong className="text-gray-900">Overview:</strong> {selectedClass.overview}
              </p>

              {/* 📌 OBJETIVOS */}
              {selectedClass.objectives?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">🎯 Class Objectives:</h3>
                  <ul className="list-disc pl-5 text-gray-700">
                    {selectedClass.objectives.map((obj: string, index: number) => (
                      <li key={index} className="mb-1">
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 📌 CONTACTO */}
              {selectedClass.contact && (
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                  📞 <strong>Contact:</strong> {selectedClass.contact}
                </p>
              )}

              {/* 📌 BOTÓN DE ACCIÓN */}
              {selectedClass.buttonLabel && (
                <div className="mt-6 text-center md:text-left">
                  <button className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition text-lg sm:text-xl">
                    {selectedClass.buttonLabel}
                  </button>
                </div>
              )}
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
