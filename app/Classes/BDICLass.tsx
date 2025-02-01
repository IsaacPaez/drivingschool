"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign } from "react-icons/fa"; // Íconos de reloj y dólar

const BDIClass: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-10">
        {/* 📌 Contenedor de imagen con Length y Price */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          {/* 📌 Imagen */}
          <Image
            src="/perf.jpg"
            alt="BDI Class"
            width={600}
            height={350}
            className="rounded-lg shadow-md"
          />

          {/* 📌 Longitud y Precio (Debajo de la imagen) */}
          <div className="mt-14 flex gap-6 text-black font-semibold">
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
        </div>
      </div>

      {/* 📌 Descripción */}
      <div className="max-w-5xl mx-auto mt-8 space-y-6">
        <div className="bg-gray-100 p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-2xl font-semibold text-[#222] mb-4">Overview</h3>
          <p className="text-black leading-relaxed">
  If you received a traffic ticket and want to{" "}
  <strong>avoid points on your license</strong>, this{" "}
  <strong>4-hour BDI course</strong> helps maintain your{" "}
  <strong>safe driver status</strong> and prevents{" "}
  <strong>insurance increases</strong>, as long as there is{" "}
  <strong>no crash associated</strong> with the traffic citation (
  <span className="text-[#0056b3] font-semibold">
    Statute 318.14(9)
  </span>
  ).
</p>

<p className="text-black leading-relaxed mt-4">
  Under Florida law, you can take this course{" "}
  <strong>once every 12 months</strong>, up to{" "}
  <strong>five times in a lifetime</strong>. This{" "}
  <strong>state-approved course</strong> satisfies{" "}
  <strong>court orders</strong> in Florida and other states.
</p>

<h3 className="text-lg font-semibold mt-4 text-black">
  Florida DHSMV may also require this course if:
</h3>

<ul className="list-disc list-inside text-black mt-2 space-y-1">
  <li><strong>🚦 Running a red light</strong></li>
  <li><strong>🚌 Passing a stopped school bus</strong></li>
  <li><strong>⚠️ Reckless driving</strong></li>
  <li><strong>🏎️ Racing or spectating illegal races</strong></li>
  <li><strong>🌎 Out-of-state ticket</strong> (for Florida license holders)</li>
</ul>

<p className="text-gray-600 mt-4 italic border-l-4 border-gray-400 pl-4">
  <strong>🚨 Note:</strong>{" "}
  <span className="text-[#0056b3]">
    Holders of a Commercial Driver’s License (CDL)
  </span>{" "}
  <span className="text-red-500">are not eligible</span> to take this course 
  voluntarily. They must complete it if ordered by a{" "}
  <strong>court or state authority</strong>.
</p>

        </div>

        <h3 className="text-xl text-black font-semibold">Delivery method</h3>
        <p className="text-black">
          The class is taught In-Person in a classroom setting, which is the
          easiest way to attend the class. We offer the class at our main
          location in West Palm Beach.
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

export default BDIClass;
