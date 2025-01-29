"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign } from "react-icons/fa"; // Íconos de reloj y dólar

const CrashClass: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-10">
        {/* 📌 Imagen a la izquierda */}
        <div className="w-full md:w-1/2">
          <Image
            src="/Crash-class.jpeg" // Asegúrate de que la imagen esté en /public
            alt="3 Crashes in 3 Years Course"
            width={600}
            height={350}
            className="rounded-lg shadow-md"
          />
        </div>

        {/* 📌 Información a la derecha */}
        <div className="w-full md:w-1/2 space-y-4">
          {/* 📌 Título */}
          <h2 className="text-4xl font-extrabold text-[#222]">
            <span className="text-[#0056b3]">3 Crashes</span> in 3 Years <br />
            Course
          </h2>

          {/* 📌 Botón de clase */}
          <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#27ae60] transition">
            See all Class Dates
          </button>

          {/* 📌 Also known as */}
          <h3 className="text-lg font-semibold text-black">Also known as</h3>
          <ul className="list-disc list-inside space-y-1 text-black">
            <li>3 In 3 Course</li>
          </ul>

          {/* 📌 Tiempo y Precio con Íconos */}
          <div className="flex items-center gap-6 text-black font-semibold">
            <p className="flex items-center gap-2">
              <FaClock className="text-[#0056b3]" /> <strong>Length:</strong>{" "}
              <span className="font-normal">12hr Class + 2 Lessons</span>
            </p>
            <p className="flex items-center gap-2">
              <FaDollarSign className="text-[#27ae60]" />{" "}
              <strong>Price:</strong>{" "}
              <span className="font-normal">$400.00</span>
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
            ⚖️ Effective January 2010, section 322.0261(1)(c) states that if you
            were convicted of a third traffic offense causing a crash within 36
            months, you must complete this course!
          </div>

          {/* 📖 Descripción detallada */}
          <p className="text-black mt-4 leading-relaxed">
            This{" "}
            <strong>12-hour Advanced Driver Improvement (ADI) Course</strong> is
            <span className="text-[#0056b3] font-semibold">
              {" "}
              department-approved{" "}
            </span>
            and includes
            <span className="text-[#27ae60] font-semibold">
              {" "}
              4 hours of behind-the-wheel training
            </span>
            at our driving school. Upon completion, an evaluation of your
            driving ability will be conducted at the DMV.
          </p>
          <p className="text-black mt-4 leading-relaxed">
            This course is <strong>required by the State of Florida</strong> for
            drivers with multiple infractions within a short period.
          </p>
        </div>

        {/* 📌 Sección de Pasos */}
        <h3 className="text-2xl font-semibold text-[#222] mb-4">
          How to complete the 3 in 3 Course
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-2xl font-bold text-[#222]">1.</h4>
            <p className="mt-2 text-black">
              Complete our <strong>12-Hour ADI Course</strong>.
            </p>
            <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md mt-4 hover:bg-[#27ae60] transition">
              Book ADI Course
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-2xl font-bold text-[#222]">2.</h4>
            <p className="mt-2 text-black">
              Take <strong>4 Hours of Behind-the-Wheel Training</strong>.
            </p>
            <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md mt-4 hover:bg-[#27ae60] transition">
              Book Driving Lesson
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-2xl font-bold text-[#222]">3.</h4>
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
        <p className="text-xl font-bold text-[#0056b3] mt-6">
          Call 561 330 7007 to Book Now
        </p>
      </div>
    </section>
  );
};

export default CrashClass;
