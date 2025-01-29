"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign, FaSearch } from "react-icons/fa"; // Íconos de reloj, dólar y búsqueda

const ADIClass: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-10">
        {/* 📌 Imagen a la izquierda */}
        <div className="w-full md:w-1/2">
          <Image
            src="/ADI-class.jpeg" // Asegúrate de que la imagen esté en /public
            alt="ADI Class"
            width={600}
            height={350}
            className="rounded-lg shadow-md"
          />
        </div>

        {/* 📌 Información a la derecha */}
        <div className="w-full md:w-1/2 space-y-4">
          {/* 📌 Título */}
          <h2 className="text-4xl font-extrabold text-[#222]">
            <span className="text-[#0056b3]">12 hr (ADI)</span> Advanced Driving{" "}
            <br />
            Improvement Class
          </h2>

          {/* 📌 Botón de clase */}
          <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#27ae60] transition">
            See all Class Dates
          </button>

          {/* 📌 Also known as */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-black">
                Also known as
              </h3>
              <ul className="list-disc list-inside space-y-1 text-black">
                <li>Advanced Driving Improvement Course</li>
                <li>12 Hours ADI</li>
                <li>12 Hours Court Ordered Suspended License</li>
                <li>12 - 18 - 24 Points Course</li>
                <li>Habitual Traffic Offender Course</li>
              </ul>
            </div>

            {/* 📌 Tiempo y Precio con Íconos */}
            <div className="text-black font-semibold">
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
      </div>

      {/* 📌 Descripción */}
      <div className="max-w-5xl mx-auto mt-8 space-y-6">
        {/* 📌 Overview Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-2xl font-semibold text-[#222] mb-4">Overview</h3>

          {/* 🛑 Destacado inicial con fondo resaltado */}
          <div className="bg-gray-200 p-4 rounded-md text-lg font-semibold italic text-gray-800">
            🚦 If you have accumulated too many traffic violations in Florida,
            your license will be suspended, and you must attend the{" "}
            <strong>12-Hour Advanced Driver Improvement (ADI)</strong> course to
            reinstate it.
          </div>

          {/* 📖 Descripción detallada */}
          <p className="text-black mt-4 leading-relaxed">
            If your <strong>license suspension period</strong> has ended, you
            may be eligible to{" "}
            <span className="text-[#0056b3] font-semibold">
              get your license reinstated
            </span>
            . To do so, you must enroll in the <strong>ADI course</strong>,
            obtain proof of enrollment, and complete the class within{" "}
            <strong>90 days</strong> at our main location in{" "}
            <span className="text-[#27ae60] font-semibold">
              West Palm Beach
            </span>
            .
          </p>

          <p className="text-black mt-4 leading-relaxed">
            If you disputed a traffic ticket in court and the{" "}
            <strong>judge ordered you to complete the ADI class</strong>, this
            12-hour program meets the legal requirements. The course is{" "}
            <span className="text-[#0056b3] font-semibold">
              approved by the Florida DHSMV
            </span>
            and is accepted in <strong>all Florida Courts</strong>.
          </p>

          <p className="text-black mt-4 leading-relaxed">
            If your license was revoked for being classified as a{" "}
            <strong>Habitual Traffic Offender (HTO)</strong>, you are required
            to take this course. Florida law mandates that HTOs lose their
            driving privileges for <strong>five years</strong>. However, after{" "}
            <span className="text-[#27ae60] font-semibold">one year</span> from
            the revocation date, you may request a{" "}
            <strong>hardship license</strong> by contacting the Florida Bureau
            of Administrative Reviews.
          </p>
        </div>

        {/* 📌 Información adicional */}
        <div className="flex items-center gap-2 text-[#0056b3] text-lg font-semibold mt-6 cursor-pointer">
          <FaSearch />
          <p>
            <strong>Want to know more?</strong>{" "}
            <span className="underline text-[#0056b3] hover:text-[#27ae60]">
              Read our FAQ
            </span>
          </p>
        </div>

        {/* 📌 Llamado a la acción */}
        <h3 className="text-xl font-semibold mt-6">
          Upcoming 12hr (ADI) Advanced Driving Improvement Class
        </h3>
        <p className="text-xl font-bold text-[#0056b3]">
          Call 561 330 7007 to Book Now
        </p>
      </div>
    </section>
  );
};

export default ADIClass;
