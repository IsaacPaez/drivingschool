"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign } from "react-icons/fa"; // Íconos de reloj y dólar

const MultiDayADIClass: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* 🔹 Contenedor Principal más angosto */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        {/* 📌 Imagen a la izquierda ajustada */}
        <div className="w-full md:w-[400px] flex flex-col items-center">
          <Image
            src="/ADV.jpg" // Asegúrate de que la imagen esté en /public
            alt="12hr ADI Multi-Day Improvement Class"
            width={460}
            height={320}
            className="rounded-lg shadow-md w-full"
          />

          {/* 📌 Length y Price alineados en una sola línea debajo de la imagen */}
          <div className="flex justify-between w-full mt-4 text-black font-semibold">
            <p className="flex items-center gap-2 whitespace-nowrap">
              <FaClock className="text-[#0056b3]" /> <strong>Length:</strong> 12 Hours
            </p>
            <p className="flex items-center gap-2 whitespace-nowrap">
              <FaDollarSign className="text-[#27ae60]" /> <strong>Price:</strong> $100.00
            </p>
          </div>
        </div>

        {/* 📌 Información a la derecha con `justify-between` */}
        <div className="w-full flex-1 flex flex-col justify-between">
          {/* 📌 Título */}
          <h2 className="text-3xl font-extrabold text-[#222]">
            <span className="text-[#0056b3]">12hr ADI</span> Multi-Day Improvement Class
          </h2>

          {/* 📌 Botón de clase con más separación del título */}
          <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#27ae60] transition mt-4">
            See all Class Dates
          </button>

          {/* 📌 Also known as con más espacio debajo del botón */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-black">Also known as</h3>
            <ul className="list-disc list-inside text-black space-y-1">
              <li>Advanced Driving Improvement Course</li>
              <li>12 Hours ADI</li>
              <li>12 Hours Court Ordered Suspended License</li>
              <li>12 - 18 - 24 Points Course</li>
              <li>Habitual Traffic Offender Course</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 🔹 Descripción debajo con el mismo ancho reducido */}
      <div className="max-w-4xl mx-auto mt-8 space-y-6">
        {/* 📌 Overview Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-[#222] mb-4">Overview</h3>

          {/* 🛑 Destacado inicial con fondo resaltado */}
          <div className="bg-gray-200 p-4 rounded-md text-base font-semibold italic text-gray-800">
            🚗 If you have a Florida driver is license and received many tickets,
            leading to a suspended license, you must complete the Advanced
            Driver Improvement (ADI) course to reinstate your license.
          </div>

          {/* 📖 Descripción detallada */}
          <p className="text-black mt-4 leading-relaxed">
            If your <strong>license suspension has passed</strong>, you may be
            eligible to
            <span className="text-[#27ae60] font-semibold">
              {" "}reinstate your driver is license
            </span>. Contact us, complete the payment, and register for the course at
            our <span className="text-[#0056b3] font-semibold">West Palm Beach location</span>.
          </p>

          <p className="text-black mt-4 leading-relaxed">
            You may also be required to attend this course if a
            <strong> judge or hearing officer</strong> mandates the 12-hour ADI
            Court Ordered Course as part of satisfying a judgment. This program
            is <strong>approved by the Florida DHSMV</strong> and meets all Florida
            court requirements.
          </p>

          <p className="text-black mt-4 leading-relaxed">
            If your license has been revoked due to being classified as a
            <span className="text-[#0056b3] font-semibold"> Habitual Traffic Offender (HTO)</span>,
            this course is a mandatory step toward applying for a hardship
            license. You may request a hardship license after
            <span className="text-[#27ae60] font-semibold"> one year from revocation</span>.
          </p>

          <p className="text-gray-600 mt-4 italic border-l-4 border-gray-400 pl-4">
            <strong>Note:</strong> Proof of enrollment in an ADI course is
            <span className="text-[#0056b3]"> required</span> for applying for a
            hardship license.
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
    </section>
  );
};

export default MultiDayADIClass;
