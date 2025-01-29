"use client";

import React from "react";

const DVDZipRequest: React.FC = () => {
  return (
    <section className="py-16 px-8 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto">
        {/* 🌟 Título */}
        <h2 className="text-4xl font-extrabold text-center mb-6">
          Request Your Course Materials
        </h2>
        <p className="text-lg text-gray-300 text-center max-w-2xl mx-auto">
          Choose how you'd like to receive your course. You can pick up a DVD at
          our location or receive a downloadable ZIP/PDF with the course
          materials.
        </p>

        {/* 📦 Opciones de Solicitud */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-8">
          {/* 🎥 Opción DVD */}
          <div className="bg-gray-800 rounded-xl p-6 w-full md:w-1/2 text-center shadow-lg">
            <h3 className="text-2xl font-bold mb-3">📀 Pick Up Your DVD</h3>
            <p className="text-gray-300 mb-4">
              Visit our office during business hours to collect your course DVD.
            </p>
            <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#27ae60] transition">
              Pick Up Your DVD
            </button>
          </div>

          {/* 📁 Opción ZIP/PDF */}
          <div className="bg-gray-800 rounded-xl p-6 w-full md:w-1/2 text-center shadow-lg">
            <h3 className="text-2xl font-bold mb-3">📂 Download ZIP/PDF</h3>
            <p className="text-gray-300 mb-4">
              Fill out the form to receive your digital course materials via
              email.
            </p>
            <button className="bg-[#27ae60] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#0056b3] transition">
              Request ZIP/PDF
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DVDZipRequest;
