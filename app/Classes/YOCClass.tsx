"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign } from "react-icons/fa"; // Íconos de reloj y dólar

const YouthfulOffenderClass: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* 🔹 Contenedor Principal más angosto */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        {/* 📌 Imagen a la izquierda ajustada */}
        <div className="w-full md:w-[400px] flex flex-col items-center">
          <Image
            src="/JD.jpg" // Asegúrate de que la imagen esté en /public
            alt="Youthful Offender Class"
            width={460}
            height={320}
            className="rounded-lg shadow-md w-full"
          />

          {/* 📌 Length y Price alineados en una sola línea debajo de la imagen */}
          <div className="flex justify-between w-full mt-7 text-black font-semibold">
            <p className="flex items-center gap-2 whitespace-nowrap">
              <FaClock className="text-[#0056b3]" /> <strong>Length:</strong> 4 Hours
            </p>
            <p className="flex items-center gap-2 whitespace-nowrap">
              <FaDollarSign className="text-[#27ae60]" /> <strong>Price:</strong> $60.00
            </p>
          </div>
        </div>

        {/* 📌 Información a la derecha con `justify-between` */}
        <div className="w-full flex-1 flex flex-col justify-between">
          {/* 📌 Título */}
          <h2 className="text-3xl font-extrabold text-[#222]">
            <span className="text-[#0056b3]">4 hr / 8 hr</span> Youthful Offender Class
          </h2>

          {/* 📌 Botón de clase con más separación del título */}
          <button className="bg-[#27ae60] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#0056b3] transition mt-4">
            See all Class Dates
          </button>

          {/* 📌 Also known as con más espacio debajo del botón */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-black">Also known as</h3>
            <ul className="list-disc list-inside text-black space-y-1">
              <li>Youthful Offender Course</li>
              <li>S.T.O.P</li>
              <li>TOAD</li>
              <li>TEEN Course</li>
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
            🚗 This STOP Teen Youthful Offender Class is recognized as the first behavioral-based 
            driver and traffic safety training program available to young drivers to satisfy their 
            Court Ordered requirements.
          </div>

          {/* 📖 Descripción detallada */}
          <p className="text-black mt-4 leading-relaxed">
            This <strong>Youthful Offender Course</strong>, also known as the 
            <span className="text-[#0056b3] font-semibold"> Teen Course, STOP Course, and TOAD Course</span>, 
            is accepted in all Florida Courts. The program is designed for young drivers 
            <strong>aged 15-24</strong> who need to develop proper driving attitudes 
            through responsible driving strategies.
          </p>

          <p className="text-black mt-4 leading-relaxed">
            This course meets the needs of <span className="text-[#0056b3] font-semibold">inexperienced young drivers</span>, 
            whose over-representation in crashes is a major concern at all levels. 
            Students will receive a <strong>certificate of completion</strong> upon finishing the course.
          </p>

          <h3 className="text-xl font-semibold text-black mt-6">Course Objectives</h3>
          <ul className="list-disc list-inside text-black mt-2 space-y-1">
            <li>Inform young drivers about transportation system components, risks, and risk management.</li>
            <li>Emphasize the dangers of peer influence and distracted driving.</li>
            <li>Educate students on <strong>DUI laws, penalties, and consequences</strong> on driving and life.</li>
            <li>Develop responsible decision-making skills through research-proven strategies.</li>
          </ul>

          <h3 className="text-xl font-semibold text-black mt-6">Delivery Method</h3>
          <p className="text-black mt-2">
            This class is <strong>court-ordered</strong> and must be attended <span className="text-[#27ae60] font-semibold">in person</span>. 
            It cannot be taken online. We offer this class at our location in <strong>West Palm Beach</strong>.
          </p>
        </div>

        {/* 📌 Llamado a la acción */}
        <div className="text-center mt-8">
          <h3 className="text-xl font-bold text-black">Upcoming 4 hr / 8 hr Youthful Offender Class</h3>
          <p className="text-lg font-bold text-blue-600 mt-2">
            Call <span className="underline">561 330 7007</span> to Book Now
          </p>
        </div>
      </div>
    </section>
  );
};

export default YouthfulOffenderClass;
