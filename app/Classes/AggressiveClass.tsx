"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign } from "react-icons/fa"; // Íconos de reloj y dólar

const AggressiveClass: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* 🔹 Contenedor Principal con imagen a la derecha */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-start gap-10">
        {/* 📌 Imagen a la derecha con Length y Price debajo */}
        <div className="w-full md:w-[450px] flex flex-col items-center">
          <Image
            src="/vel.jpg" // Asegúrate de que la imagen esté en /public
            alt="Aggressive Driving Class"
            width={450}
            height={300}
            className="rounded-lg shadow-md w-full"
          />

          {/* 📌 Length y Price alineados en una sola línea debajo de la imagen */}
          <div className="flex justify-between w-full mt-12 text-black font-semibold">
            <p className="flex items-center gap-2">
              <FaClock className="text-[#0056b3]" /> <strong>Length:</strong>{" "}
              8 Hours
            </p>
            <p className="flex items-center gap-2">
              <FaDollarSign className="text-[#27ae60]" /> <strong>Price:</strong>{" "}
              $75.00
            </p>
          </div>
        </div>

        {/* 📌 Información a la izquierda */}
        <div className="w-full flex-1 space-y-4">
          {/* 📌 Título */}
          <h2 className="text-4xl font-extrabold text-[#222]">
            <span className="text-[#0056b3]">8 hr</span> Aggressive Driving{" "}
            <br />
            Improvement Class
          </h2>

          {/* 📌 Botón de clase con más espacio del título */}
          <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#27ae60] transition mt-6">
            See all Class Dates
          </button>

          {/* 📌 Also known as con mejor espaciado */}
          <h3 className="text-lg font-semibold text-black mt-6">Also known as</h3>
          <ul className="list-disc list-inside text-black space-y-1">
            <li>Defensive Driving Course</li>
            <li>Florida Aggressive Driver Course</li>
            <li>8-Hour Aggressive Driving Program</li>
          </ul>
        </div>
      </div>

      {/* 🔹 Descripción debajo */}
      <div className="max-w-5xl mx-auto mt-8 space-y-6">
        {/* 📌 Overview Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-2xl font-semibold text-[#222] mb-4">Overview</h3>

          {/* 🛑 Destacado inicial con fondo resaltado */}
          <div className="bg-gray-200 p-4 rounded-md text-base font-semibold italic text-gray-800">
            ⚠️ If you have been involved in multiple aggressive driving
            incidents, this <strong>8-hour Aggressive Driving Course</strong> is
            required to{" "}
            <span className="text-[#27ae60] font-semibold">
              improve your driving habits
            </span>{" "}
            and <strong>avoid further legal consequences</strong>.
          </div>

          {/* 📖 Descripción detallada */}
          <p className="text-black mt-4 leading-relaxed">
            This <strong>Aggressive Driving Improvement Course</strong> is{" "}
            <span className="text-[#0056b3] font-semibold">court-mandated</span>{" "}
            for individuals who have exhibited reckless, aggressive, or unsafe
            driving behaviors. The course helps drivers understand the dangers
            of aggressive driving and{" "}
            <strong>teaches defensive driving techniques</strong> to prevent
            accidents.
          </p>

          <p className="text-black mt-4 leading-relaxed">
            This course is <strong>approved by the Florida DHSMV</strong> and
            meets the{" "}
            <span className="text-[#27ae60] font-semibold">
              state’s legal requirements
            </span>{" "}
            for drivers who need to complete a mandatory training program.
          </p>

          <h3 className="text-lg font-semibold mt-4 text-black">
            You may be required to take this course if:
          </h3>
          <ul className="list-disc list-inside text-black mt-2 space-y-1">
            <li>🚗 Multiple aggressive driving violations</li>
            <li>⚠️ Reckless or high-speed driving convictions</li>
            <li>🏎 Street racing or dangerous maneuvers</li>
            <li>🛑 Road rage-related incidents</li>
            <li>📍 Court-ordered defensive driving program</li>
          </ul>

          <p className="text-gray-600 mt-4 italic border-l-4 border-gray-400 pl-4">
            <strong>Note:</strong> This course is only for{" "}
            <span className="text-[#0056b3]">court-ordered</span> drivers and is
            not an elective driving course.
          </p>
        </div>

        <h3 className="text-xl text-black font-semibold">Delivery method</h3>
        <p className="text-black">
          This class is conducted <strong>in person</strong> at our training
          center in{" "}
          <span className="text-[#27ae60] font-semibold">West Palm Beach</span>.
          Attendance is required to receive certification.
        </p>

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
    </section>
  );
};

export default AggressiveClass;
