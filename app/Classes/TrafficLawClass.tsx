"use client";

import React from "react";
import Image from "next/image";

const TrafficLawClass: React.FC = () => {
  return (
    <div className="space-y-10">
      {/* 📌 Contenedor principal con mejor estructura */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        {/* 📌 Título y contenido principal */}
        <div className="flex-1 space-y-4">
          <h2 className="text-5xl font-extrabold text-gray-900 leading-tight">
            <span className="text-blue-600">4HR</span> TRAFFIC LAW <br />&{" "}
            <span className="text-green-600">SUBSTANCE ABUSE CLASS</span>
          </h2>

          {/* 📌 Botón alineado */}
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-600 transition">
            See all Class Dates
          </button>

          {/* 📌 Sección de información sin cuadro */}
          <div className="space-y-4 mt-6">
            <h3 className="text-xl font-bold text-gray-900">Also known as:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 pl-4">
              <li>First Time Driver Class</li>
              <li>Drug Alcohol Traffic Education (DATE)</li>
              <li>Traffic Law Substance Abuse Education Class (TLSAE)</li>
            </ul>

            {/* 📌 Longitud y Precio alineados sin cuadro */}
            <div className="text-gray-900 font-semibold space-y-1">
              <p>
                <strong>Length:</strong>{" "}
                <span className="font-normal">4 Hours</span>
              </p>
              <p>
                <strong>Price:</strong>{" "}
                <span className="font-normal">$50.00</span>
              </p>
            </div>
          </div>
        </div>

        {/* 📌 Imagen circular alineada */}
        <div className="w-48 h-48 md:w-56 md:h-56 overflow-hidden rounded-full shadow-lg flex-shrink-0">
          <Image
            src="/ADD.jpg"
            alt="Traffic Law Class"
            width={500}
            height={500}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* 📌 Descripción con mejor alineación */}
      <div className="space-y-6">
        <h3 className="text-xl text-gray-900 font-semibold">Overview</h3>
        <p className="text-gray-700 leading-relaxed">
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

        <h3 className="text-xl text-gray-900 font-semibold">Class Objectives</h3>
        <p className="text-gray-700 leading-relaxed">
          The goal of this course is to reduce the number of persons killed and/or 
          injured on Florida’s highways. The program aims to help students of all 
          ages become well-informed, responsible drivers by providing them with 
          accurate information about Florida laws, the effects of alcohol and 
          other drugs on driving skills, and techniques on how to drive 
          defensively to avoid crashes.
        </p>
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
