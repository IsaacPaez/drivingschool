"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign } from "react-icons/fa"; // Íconos de reloj y dólar

const MultiDayADIClass: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-10">
        {/* 📌 Imagen a la izquierda */}
        <div className="w-full md:w-1/2">
          <Image
            src="/multi-day-adi.jpg" // Asegúrate de que la imagen esté en /public
            alt="12hr ADI Multi-Day Improvement Class"
            width={600}
            height={350}
            className="rounded-lg shadow-md"
          />
        </div>

        {/* 📌 Información a la derecha */}
        <div className="w-full md:w-1/2 space-y-4">
          {/* 📌 Título */}
          <h2 className="text-4xl font-extrabold text-[#222]">
            <span className="text-[#0056b3]">12hr ADI</span> Multi-Day
            Improvement Class
          </h2>

          {/* 📌 Botón de clase */}
          <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#27ae60] transition">
            See all Class Dates
          </button>

          {/* 📌 Also known as */}
          <h3 className="text-lg font-semibold text-black">Also known as</h3>
          <ul className="list-disc list-inside space-y-1 text-black">
            <li>Advanced Driving Improvement Course</li>
            <li>12 Hours ADI</li>
            <li>12 Hours Court Ordered Suspended License</li>
            <li>12 - 18 - 24 Points Course</li>
            <li>Habitual Traffic Offender Course</li>
          </ul>

          {/* 📌 Tiempo y Precio con Íconos */}
          <div className="flex items-center gap-6 text-black font-semibold">
            <p className="flex items-center gap-2">
              <FaClock className="text-[#0056b3]" /> <strong>Length:</strong>{" "}
              <span className="font-normal">12 Hours</span>
            </p>
            <p className="flex items-center gap-2">
              <FaDollarSign className="text-[#27ae60]" />{" "}
              <strong>Price:</strong>{" "}
              <span className="font-normal">$100.00</span>
            </p>
          </div>
        </div>
      </div>

      {/* 📌 Descripción */}
      <div className="max-w-5xl mx-auto mt-8 space-y-6">
        {/* 📌 Overview Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-2xl font-semibold text-[#222] mb-4">Overview</h3>

          {/* 🛑 Destacado inicial con fondo resaltado */}
          <div className="bg-gray-200 p-4 rounded-md text-lg font-semibold italic text-gray-800">
            🚗 If you have a Florida driver's license and received many tickets,
            leading to a suspended license, you must complete the Advanced
            Driver Improvement (ADI) course to reinstate your license.
          </div>

          {/* 📖 Descripción detallada */}
          <p className="text-black mt-4 leading-relaxed">
            If your <strong>license suspension has passed</strong>, you may be
            eligible to
            <span className="text-[#27ae60] font-semibold">
              {" "}
              reinstate your driver's license
            </span>
            . Contact us, complete the payment, and register for the course at
            our
            <span className="text-[#0056b3] font-semibold">
              {" "}
              West Palm Beach location
            </span>
            .
          </p>

          <p className="text-black mt-4 leading-relaxed">
            You may also be required to attend this course if a
            <strong>judge or hearing officer</strong> mandates the 12-hour ADI
            Court Ordered Course as part of satisfying a judgment. This program
            is
            <strong>approved by the Florida DHSMV</strong> and meets all Florida
            court requirements.
          </p>

          <p className="text-black mt-4 leading-relaxed">
            If your license has been revoked due to being classified as a
            <span className="text-[#0056b3] font-semibold">
              {" "}
              Habitual Traffic Offender (HTO)
            </span>
            , this course is a mandatory step toward applying for a hardship
            license. You may request a hardship license after
            <span className="text-[#27ae60] font-semibold">
              {" "}
              one year from revocation
            </span>
            .
          </p>

          <p className="text-gray-600 mt-4 italic border-l-4 border-gray-400 pl-4">
            <strong>Note:</strong> Proof of enrollment in an ADI course is
            <span className="text-[#0056b3]"> required</span> for applying for a
            hardship license.
          </p>
        </div>

        {/* 📌 FAQ Section */}
        <div className="bg-gray-100 p-4 rounded-md shadow-md">
          <p className="text-lg font-semibold flex items-center">
            ❓{" "}
            <span className="ml-2">
              Want to know more?{" "}
              <a href="/faq" className="text-[#0056b3] font-bold underline">
                Read our FAQ
              </a>
            </span>
          </p>
        </div>

        {/* 📌 Llamado a la acción */}
        <p className="text-xl font-bold text-[#0056b3] mt-6">
          Call 561 330 7007 to Book Now
        </p>
      </div>
    </section>
  );
};

export default MultiDayADIClass;
