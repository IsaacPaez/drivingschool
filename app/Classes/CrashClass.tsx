"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign } from "react-icons/fa"; // Íconos de reloj y dólar

const CrashClass: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* 🔹 Contenedor Principal con `justify-between` para mejor distribución */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        {/* 📌 Imagen a la izquierda */}
        <div className="w-full md:w-[400px] flex flex-col items-center">
          <Image
            src="/CC.jpg" // Asegúrate de que la imagen esté en /public
            alt="3 Crashes in 3 Years Course"
            width={480}
            height={350}
            className="rounded-lg shadow-md w-full"
          />

          {/* 📌 Length y Price alineados en una sola línea debajo de la imagen */}
          <div className="flex justify-between w-full mt-4 text-black font-semibold">
            <p className="flex items-center gap-2 whitespace-nowrap">
              <FaClock className="text-[#0056b3]" /> <strong>Length:</strong>{" "}
              <span>12hr Class + 2 Lessons</span>
            </p>
            <p className="flex items-center gap-2 whitespace-nowrap">
              <FaDollarSign className="text-[#27ae60]" /> <strong>Price:</strong>{" "}
              <span>$400.00</span>
            </p>
          </div>
        </div>

        {/* 📌 Información a la derecha con `justify-between` para alinear bien */}
        <div className="w-full flex-1 flex flex-col justify-between">
          {/* 📌 Título */}
          <h2 className="text-3xl font-extrabold text-[#222]">
            <span className="text-[#27ae60]">3 Crashes</span> in 3 Years <br />
            Course
          </h2>

          {/* 📌 Botón de clase con más separación del título */}
          <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#27ae60] transition mt-4">
            See all Class Dates
          </button>

          {/* 📌 Also known as alineado más abajo con `mt-auto` */}
          <div className="-mt-auto">
            <h3 className="text-lg font-semibold text-black">Also known as</h3>
            <ul className="list-disc list-inside text-black space-y-1">
              <li>3 In 3 Course</li>
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
            ⚖️ As of January 2010, section 322.0261(1)(c) requires drivers convicted of a third at-fault crash within 36 months to complete this course within 90 days to avoid license suspension.
          </div>

          {/* 📖 Descripción detallada */}
          <p className="text-black mt-4 leading-relaxed">
            This <strong>12-hour Advanced Driver Improvement (ADI) Course</strong> is 
            <span className="text-[#0056b3] font-semibold"> department-approved </span> 
            and includes 
            <span className="text-[#27ae60] font-semibold"> 4 hours of behind-the-wheel training</span> 
            at our school. The final step is a <strong>driving test at the DMV</strong>.
          </p>
          <p className="text-black mt-4 leading-relaxed">
            The department notifies eligible drivers of this requirement after a qualifying third at-fault crash.
          </p>
        </div>

        {/* 📌 Sección de Pasos */}
        <h3 className="text-sm font-semibold text-black  mb-4">
          How to complete the 3 in 3 Course
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-2xl font-bold text-[#222]">1</h4>
            <p className="mt-2 text-black">
              Complete our <strong>12-Hour ADI Course</strong>.
            </p>
            <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md mt-4 hover:bg-[#27ae60] transition">
              Book ADI Course
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-2xl font-bold text-[#222]">2</h4>
            <p className="mt-2 text-black">
              Take <strong>4 Hours of Behind-the-Wheel Training</strong>.
            </p>
            <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md mt-4 hover:bg-[#27ae60] transition">
              Book Driving Lesson
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-2xl font-bold text-[#222]">3</h4>
            <p className="mt-2 text-black">
              Pass the <strong>extended road test</strong> at the DMV or Tax
              Collector’s Office.
            </p>
          </div>
        </div>

        <p className="text-black mt-4 leading-relaxed">
          After successfully completing all steps, we will{" "}
          <span className="text-[#0056b3] font-semibold">
            notify the State of Florida electronically
          </span>{" "}
          about your course completion.
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

export default CrashClass;
