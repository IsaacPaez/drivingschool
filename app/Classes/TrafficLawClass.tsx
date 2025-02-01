"use client";

import React from "react";

const TrafficLawClass: React.FC = () => {
  return (
    <div className="space-y-10">
      {/* 📌 Contenedor principal */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        {/* 📌 Título y contenido */}
        <div className="flex-1 space-y-4">
          <h2 className="text-5xl font-extrabold text-gray-900 leading-tight">
            <span className="text-red-600">4HR</span> TRAFFIC LAW <br />&{" "}
            <span className="text-green-600">SUBSTANCE ABUSE CLASS</span>
          </h2>

          {/* 📌 Botón */}
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-600 transition">
            See all Class Dates
          </button>

          {/* 📌 Sección de información alineada */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-900">Also known as:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>First Time Driver Class</li>
              <li>
                Drug Alcohol Traffic Education (DATE)
                <span className="ml-40 text-black font-bold">
                  <strong>Length:</strong> 4 hours
                </span>
              </li>
              <li>
                Traffic Law Substance Abuse Education Class (TLSAE)
                <span className="ml-10 text-black font-bold">
                  <strong>Price:</strong> $50.00
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 📌 Contenedor de la descripción con más espacio */}
      <div
        className="container p-1 rounded-lg bg-contain bg-no-repeat bg-center min-h-[110px]" // Ajustado el alto mínimo
        style={{
          backgroundImage: `url('/SAC.jpg')`, // Imagen de fondo
          backgroundSize: "contain", // La imagen se ajusta sin ser recortada
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* 📌 Contenido encima de la imagen con más padding */}
        <div className="relative z-10 text-gray-900 space-y-6 bg-white bg-opacity-80 p-10 rounded-lg">
          <h3 className="text-xl font-semibold">Overview</h3>
          <p className="leading-relaxed">
            <em>
              Since 1990, all first-time drivers in Florida must complete the TLSAE - 
              Traffic Law Substance Abuse Education Course before applying for a 
              driver’s license or learner’s permit.
            </em>{" "}
            <br />
            <br />
            Take this class at our school in a fun and easy atmosphere! By taking this 
            course, you will learn how alcohol and other drugs affect your ability to 
            drive safely, laws and responsibilities, safe driving techniques, and how 
            to increase your awareness on Florida roadways.
          </p>

          <h3 className="text-xl font-semibold">Class Objectives</h3>
          <p className="leading-relaxed">
            The goal of this course is to reduce the number of persons killed and/or 
            injured on Florida’s highways. The program aims to help students of all 
            ages become well-informed, responsible drivers by providing them with 
            accurate information about Florida laws, the effects of alcohol and 
            other drugs on driving skills, and techniques on how to drive 
            defensively to avoid crashes.
          </p>
        </div>
      </div>

      {/* 📌 Llamado a la acción */}
      <div className="text-center mt-8">
        <h3 className="text-xl font-bold text-black">
          Upcoming 4hr Traffic Law & Substance Abuse Class
        </h3>
        <p className="text-lg font-bold text-blue-600 mt-2">
          Call <span className="underline">561 330 7007</span> to Book Now
        </p>
      </div>
    </div>
  );
};

export default TrafficLawClass;
