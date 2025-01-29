"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign } from "react-icons/fa"; // Íconos de reloj y dólar

const SeniorInsuranceDiscount: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-10">
        {/* 📌 Imagen a la izquierda */}
        <div className="w-full md:w-1/2">
          <Image
            src="/senior-insurance-class.jpeg" // Asegúrate de que la imagen esté en /public
            alt="Senior Insurance Discount Class"
            width={600}
            height={350}
            className="rounded-lg shadow-md"
          />
        </div>

        {/* 📌 Información a la derecha */}
        <div className="w-full md:w-1/2 space-y-4">
          {/* 📌 Título */}
          <h2 className="text-4xl font-extrabold text-[#222]">
            <span className="text-[#0056b3]">Senior Insurance</span> Discount
            Class
          </h2>

          {/* 📌 Botón de clase */}
          <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#27ae60] transition">
            See all Class Dates
          </button>

          {/* 📌 Also known as */}
          <h3 className="text-lg font-semibold text-black">Also known as</h3>
          <ul className="list-disc list-inside space-y-1 text-black">
            <li>Senior Discount Course</li>
            <li>55 and Over Insurance Discount Course</li>
          </ul>

          {/* 📌 Tiempo y Precio con Íconos */}
          <div className="flex items-center gap-6 text-black font-semibold">
            <p className="flex items-center gap-2">
              <FaClock className="text-[#0056b3]" /> <strong>Length:</strong>{" "}
              <span className="font-normal">4 Hours</span>
            </p>
            <p className="flex items-center gap-2">
              <FaDollarSign className="text-[#27ae60]" />{" "}
              <strong>Price:</strong>{" "}
              <span className="font-normal">$32.00</span>
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
            🌟 If you are <strong>55 years of age or older</strong>, you can
            <span className="text-[#27ae60] font-semibold">
              {" "}
              save on your insurance rates
            </span>{" "}
            by attending our Mature Driver Course.
          </div>

          {/* 📖 Descripción detallada */}
          <p className="text-black mt-4 leading-relaxed">
            In the State of Florida, <strong>Insurance Companies</strong> are{" "}
            <span className="text-[#0056b3] font-semibold">
              mandated by law
            </span>{" "}
            to reduce the rates of your insurance for{" "}
            <strong>three years</strong> if you attend a Mature Driver Course.
          </p>
          <p className="text-black mt-4 leading-relaxed">
            The amount of the discount{" "}
            <span className="text-[#27ae60] font-semibold">
              varies by insurance company
            </span>
            . Check with your <strong>insurance agent</strong> for details on
            how much you can save.
          </p>
        </div>

        {/* 📌 Llamado a la acción */}
        <h3 className="text-xl font-semibold mt-6">
          Upcoming Senior Insurance Discount Classes
        </h3>
        <p className="text-xl font-bold text-[#0056b3]">
          Call 561 330 7007 to Book Now
        </p>
      </div>
    </section>
  );
};

export default SeniorInsuranceDiscount;
