"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign } from "react-icons/fa"; // Íconos de reloj y dólar

const BDIClass: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-10">
        {/* 📌 Imagen a la izquierda */}
        <div className="w-full md:w-1/2">
          <Image
            src="/BDI-class.jpeg" // Asegúrate de que la imagen esté en /public
            alt="BDI Class"
            width={600}
            height={350}
            className="rounded-lg shadow-md"
          />
        </div>

        {/* 📌 Información a la derecha */}
        <div className="w-full md:w-1/2 space-y-4">
          {/* 📌 Título */}
          <h2 className="text-4xl font-extrabold text-[#222]">
            <span className="text-[#0056b3]">4 hr (BDI)</span> Basic Driving{" "}
            <br />
            Improvement Class
          </h2>

          {/* 📌 Botón de clase */}
          <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#27ae60] transition">
            See all Class Dates
          </button>

          {/* 📌 Also known as */}
          <h3 className="text-lg font-semibold text-black">Also known as</h3>
          <ul className="list-disc list-inside space-y-1 text-black">
            <li>4 Hours BDI Ticket Course</li>
            <li>Court Ordered 4 Hour Class</li>
            <li>4 Hours Ticket Class</li>
            <li>Traffic Crash Avoidance Course (TCAC)</li>
            <li>Basic Driving Improvement Course</li>
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
              <span className="font-normal">$50.00</span>
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
            🚗 If you got a Traffic Ticket and want to avoid points, this 4-Hour
            Basic Driver Improvement (BDI) course is the class you need to
            attend!
          </div>

          {/* 📖 Descripción detallada */}
          <p className="text-black mt-4 leading-relaxed">
            By attending this <strong>4-hour traffic ticket class</strong>, you
            will <strong>not receive any points</strong> on your Driver’s
            license record for the violation. Your{" "}
            <strong>insurance will not increase</strong> as long as there is{" "}
            <strong>no crash associated</strong> with the traffic citation (
            <span className="text-[#0056b3] font-semibold">
              statute 318.14 (9)
            </span>
            ), and you will maintain your <strong>safe driver status</strong>.
            Under Florida law, you may elect to attend this{" "}
            <strong>4-hour BDI (Basic Driver Improvement)</strong> course{" "}
            <span className="text-[#27ae60] font-semibold">
              once in any 12-month period
            </span>
            but no more than <strong>five times</strong> in your whole life.
          </p>
          <p className="text-black mt-4 leading-relaxed">
            If you are <strong>Court-ordered</strong> by a judge in any{" "}
            <span className="text-[#0056b3] font-semibold">Florida County</span>
            to attend a <strong>4-hour BDI Class</strong>, you may enroll in
            this course to
            <span className="text-[#27ae60] font-semibold">
              {" "}
              satisfy the court requirements
            </span>
            . This <strong>state-approved program</strong> is recognized by the
            <span className="text-[#0056b3] font-semibold">
              {" "}
              Florida Department of Motor Vehicles
            </span>
            and <strong>all Florida Courts</strong>, ensuring compliance with
            legal mandates.
          </p>
          <p className="text-black mt-4 leading-relaxed">
            You may attend this class to{" "}
            <span className="text-[#27ae60] font-semibold">
              satisfy Court-Ordered requirements
            </span>
            for other States.
          </p>

          <h3 className="text-lg font-semibold mt-4 text-black">
            Florida DHSMV may also require you to take this course if:
          </h3>
          <ul className="list-disc list-inside text-black mt-2 space-y-1">
            <li>
              <strong>🚦 Red Light Violation:</strong> Found guilty by a court.
            </li>
            <li>
              <strong>🚌 School Bus Violation:</strong> Passing a stopped school
              bus.
            </li>
            <li>
              <strong>⚠️ Reckless Driving:</strong> Endangering others on the
              road.
            </li>
            <li>
              <strong>🏎️ Racing:</strong> Participating or organizing illegal
              street races.
            </li>
            <li>
              <strong>👀 Spectator of a Race:</strong> Being involved in illegal
              racing events.
            </li>
            <li>
              <strong>🌎 Out-of-State Ticket:</strong> Required if you received
              a ticket outside of Florida.
            </li>
          </ul>

          <p className="text-gray-600 mt-4 italic border-l-4 border-gray-400 pl-4">
            <strong>Note:</strong>{" "}
            <span className="text-[#0056b3]">
              Holders of a Commercial Driver’s License (CDL)
            </span>
            are <span className="text-red-500">not eligible</span> to take this
            course by election per statute 318.14. They must take this course if
            ordered by the Court or State.
          </p>
        </div>

        <h3 className="text-xl font-semibold">Delivery method</h3>
        <p className="text-black">
          The class is taught In-Person in classroom setting, which is the
          easiest way to attend the class. We offer the class at our main
          location in West Palm Beach
        </p>

        {/* 📌 Llamado a la acción */}
        <p className="text-xl font-bold text-[#0056b3]">
          Call 561 330 7007 to Book Now
        </p>
      </div>
    </section>
  );
};

export default BDIClass;
