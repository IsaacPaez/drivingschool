"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign } from "react-icons/fa";

const IDIClass: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* 🔹 Contenedor Principal con ancho reducido y contenido alineado */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row-reverse items-start gap-8">
        {/* 📌 Imagen a la derecha con tamaño más pequeño y alineada */}
        <div className="w-[350px] ml-auto mt-8">
          <Image
            src="/mart.jpg"
            alt="IDI Class"
            width={220}
            height={300}
            className="rounded-lg shadow-md w-full"
          />
        </div>

        {/* 📌 Información a la izquierda */}
        <div className="w-full md:w-1/2 space-y-4 text-left">
          {/* 📌 Título */}
          <h2 className="text-3xl font-extrabold text-[#222]">
            <span className="text-[#27ae60]">8 hr</span> Court Ordered <br />
            IDI Intermediate Class
          </h2>

          {/* 📌 Botón */}
          <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#27ae60] transition">
            See all Class Dates
          </button>

          {/* 📌 Also known as */}
          <h3 className="text-lg font-semibold text-black">Also known as</h3>
          <ul className="list-disc list-inside space-y-1 text-black">
            <li>8 Hours Court Ordered</li>
            <li>8 Hour Intermediate Driving Improvement Class</li>
            <li>Intermediate Driving Course (IDC)</li>
            <li>Intermediate Driving Improvement Course (IDI)</li>
          </ul>

          {/* 📌 Tiempo y Precio alineados correctamente */}
          <div className="flex justify-between text-black font-semibold">
            <p className="flex items-center gap-2">
              <FaClock className="text-[#0056b3]" /> <strong>Length:</strong>{" "}
              <span className="font-normal">8 Hours</span>
            </p>
            <p className="flex items-center gap-2">
              <FaDollarSign className="text-[#27ae60]" />{" "}
              <strong>Price:</strong>{" "}
              <span className="font-normal">$80.00</span>
            </p>
          </div>
        </div>
      </div>

      {/* 🔹 Descripción alineada con la imagen */}
      <div className="max-w-4xl mx-auto mt-8 space-y-6">
        {/* 📌 Overview Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-[#222] mb-4">Overview</h3>

          <div className="bg-gray-200 p-4 rounded-md text-base font-semibold italic text-gray-800">
            🏛 If a Florida Court or Judge ordered you to take the{" "}
            <strong>8 Hour Traffic Course in-person</strong>, this is the course
            you need to attend.
          </div>

          {/* 📖 Descripción detallada */}
          <p className="text-black mt-4 leading-relaxed text-justify">
            Simply register for the course <strong>over the phone</strong> or{" "}
            <strong>online</strong>. The class is taught in a{" "}
            <span className="text-[#0056b3] font-semibold">
              pleasant and painless environment
            </span>
            . Upon completion, you will receive your{" "}
            <strong>certificate of completion</strong>, and we will{" "}
            <span className="text-[#27ae60] font-semibold">
              notify the court
            </span>{" "}
            of your school attendance, depending on the county where the ticket
            was issued.
          </p>
          <p className="text-black mt-4 leading-relaxed text-justify">
            We offer{" "}
            <span className="text-[#27ae60] font-semibold">
              flexible schedules
            </span>{" "}
            so you can complete the class and{" "}
            <strong>satisfy court requirements</strong> in Palm Beach County.
          </p>
        </div>

        {/* 📌 Llamado a la acción */}
        <h3 className="text-xl text-black font-semibold mt-6 text-center">
          Upcoming 8hr Court Ordered IDI Intermediate Driving Improvement Class
        </h3>
        <p className="text-xl font-bold text-[#0056b3] text-center">
          Call 561 330 7007 to Book Now
        </p>
      </div>
    </section>
  );
};

export default IDIClass;
