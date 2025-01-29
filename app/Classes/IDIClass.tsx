"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign } from "react-icons/fa"; // Íconos de reloj y dólar

const IDIClass: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-10">
        {/* 📌 Imagen a la izquierda */}
        <div className="w-full md:w-1/2">
          <Image
            src="/IDI-class.jpeg" // Asegúrate de que la imagen esté en /public
            alt="IDI Class"
            width={600}
            height={350}
            className="rounded-lg shadow-md"
          />
        </div>

        {/* 📌 Información a la derecha */}
        <div className="w-full md:w-1/2 space-y-4">
          {/* 📌 Título */}
          <h2 className="text-4xl font-extrabold text-[#222]">
            <span className="text-[#0056b3]">8 hr</span> Court Ordered <br />
            IDI Intermediate Class
          </h2>

          {/* 📌 Botón de clase */}
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

          {/* 📌 Tiempo y Precio con Íconos */}
          <div className="flex items-center gap-6 text-black font-semibold">
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

      {/* 📌 Descripción */}
      <div className="max-w-5xl mx-auto mt-8 space-y-6">
        {/* 📌 Overview Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-2xl font-semibold text-[#222] mb-4">Overview</h3>

          {/* 🛑 Destacado inicial con fondo resaltado */}
          <div className="bg-gray-200 p-4 rounded-md text-lg font-semibold italic text-gray-800">
            🏛 If a Florida Court or Judge ordered you to take the{" "}
            <strong>8 Hour Traffic Course in-person</strong>, this is the course
            you need to attend.
          </div>

          {/* 📖 Descripción detallada */}
          <p className="text-black mt-4 leading-relaxed">
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
          <p className="text-black mt-4 leading-relaxed">
            We offer{" "}
            <span className="text-[#27ae60] font-semibold">
              flexible schedules
            </span>{" "}
            so you can complete the class and{" "}
            <strong>satisfy court requirements</strong> in Palm Beach County.
          </p>
        </div>

        {/* 📌 Class Objectives */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-[#222] mb-4">
            Class Objectives
          </h3>
          <p className="text-black leading-relaxed">
            This class will help you{" "}
            <strong>increase your knowledge and awareness</strong> of the
            highway transportation system, recognize{" "}
            <span className="text-[#0056b3] font-semibold">
              potential hazards
            </span>
            , and understand how{" "}
            <span className="text-[#27ae60] font-semibold">
              attitude plays a role
            </span>{" "}
            in driving behavior.
          </p>
          <p className="text-black mt-4 leading-relaxed">
            This course is{" "}
            <strong>approved for all Florida County Courts</strong> and is
            recognized by other states as well.
          </p>
        </div>

        {/* 📌 Election Option */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-[#222] mb-4">
            Can this class be attended as an election?
          </h3>
          <p className="text-black leading-relaxed">
            <strong>Yes!</strong> Miami-Dade and Broward Counties allow you to
            take this{" "}
            <span className="text-[#0056b3] font-semibold">
              8-hour Intermediate Driving Improvement Course
            </span>{" "}
            to remove points from your second ticket, if you have already
            attended a{" "}
            <span className="text-[#27ae60] font-semibold">
              4-hour Basic Driver Improvement course
            </span>{" "}
            within the past 12 months.
          </p>
          <p className="text-gray-600 mt-4 italic border-l-4 border-gray-400 pl-4">
            <strong>Note:</strong> This course is{" "}
            <span className="text-red-500 font-semibold">NOT</span> for the{" "}
            <span className="text-[#0056b3] font-semibold">
              8-Hour Driving While License Suspended Course.
            </span>
          </p>
        </div>

        {/* 📌 Llamado a la acción */}
        <h3 className="text-xl font-semibold mt-6">
          Upcoming 8hr Court Ordered IDI Intermediate Driving Improvement Class
        </h3>
        <p className="text-xl font-bold text-[#0056b3]">
          Call 561 330 7007 to Book Now
        </p>
      </div>
    </section>
  );
};

export default IDIClass;
