"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign } from "react-icons/fa"; // Íconos de reloj y dólar

const SeniorInsuranceDiscount: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* 🔹 Contenedor Principal más angosto */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        {/* 📌 Imagen a la izquierda ajustada */}
        <div className="w-full md:w-[350px] flex flex-col items-center">
          <Image
            src="/senior.jpg" // Asegúrate de que la imagen esté en /public
            alt="Senior Insurance Discount Class"
            width={420}
            height={300}
            className="rounded-lg shadow-md w-full"
          />

          {/* 📌 Length y Price alineados en una sola línea debajo de la imagen */}
          <div className="flex justify-between w-full mt-4 text-black font-semibold">
            <p className="flex items-center gap-2 whitespace-nowrap">
              <FaClock className="text-[#0056b3]" /> <strong>Length:</strong> 4 Hours
            </p>
            <p className="flex items-center gap-2 whitespace-nowrap">
              <FaDollarSign className="text-[#27ae60]" /> <strong>Price:</strong> $32.00
            </p>
          </div>
        </div>

        {/* 📌 Información a la derecha con `justify-between` */}
        <div className="w-full flex-1 flex flex-col justify-between">
          {/* 📌 Título */}
          <h2 className="text-3xl font-extrabold text-[#222]">
            <span className="text-[#0056b3]">Senior Insurance</span> Discount Class
          </h2>

          {/* 📌 Botón de clase con más separación del título */}
          <button className="bg-[#27ae60] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#0056b3] transition mt-4">
            See all Class Dates
          </button>

          {/* 📌 Also known as con más espacio debajo del botón */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-black">Also known as</h3>
            <ul className="list-disc list-inside text-black space-y-1">
              <li>Senior Discount Course</li>
              <li>55 and Over Insurance Discount Course</li>
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
            🌟 If you are <strong>55 years of age or older</strong>, you can
            <span className="text-[#27ae60] font-semibold"> save on your insurance rates</span>
            by attending our Mature Driver Course.
          </div>

          {/* 📖 Descripción detallada */}
          <p className="text-black mt-4 leading-relaxed">
            In the State of Florida, <strong>Insurance Companies</strong> are
            <span className="text-[#0056b3] font-semibold"> mandated by law</span>
            to reduce the rates of your insurance for <strong>three years</strong> if you attend a Mature Driver Course.
          </p>
          <p className="text-black mt-4 leading-relaxed">
            The amount of the discount <span className="text-[#27ae60] font-semibold">varies by insurance company</span>.
            Check with your <strong>insurance agent</strong> for details on how much you can save.
          </p>
        </div>

        {/* 📌 Llamado a la acción */}
        <div className="text-center mt-8">
          <h3 className="text-xl font-bold text-black">Upcoming Senior Insurance Discount Classes</h3>
          <p className="text-lg font-bold text-blue-600 mt-2">
            Call <span className="underline">561 330 7007</span> to Book Now
          </p>
        </div>
      </div>
    </section>
  );
};

export default SeniorInsuranceDiscount;
