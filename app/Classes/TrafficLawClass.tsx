"use client";

import React from "react";
import Image from "next/image";

const TrafficLawClass: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* 📌 Título con estilo */}
      <h2 className="text-5xl font-extrabold text-[#222] leading-tight">
        <span className="text-red-600">4HR</span> TRAFFIC LAW <br />&{" "}
        <span className="text-[#27ae60]">SUBSTANCE ABUSE CLASS</span>
      </h2>

      {/* Botón */}
      <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#27ae60] transition">
        See all Class Dates
      </button>

      {/* Imagen y detalles */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Información */}
        <div className="flex flex-col space-y-3 w-full">
          <h3 className="text-lg text-black font-semibold">Also known as</h3>
          <ul className="list-disc list-inside text-black pl-5 space-y-1">
            <li>First Time Driver Class</li>
            <li>Drug Alcohol Traffic Education (DATE)</li>
            <li>Traffic Law Substance Abuse Education Class (TLSAE)</li>
          </ul>

          {/* Longitud y Precio */}
          <div className="flex flex-col text-black font-semibold mt-3 space-y-1">
            <p>
              <strong>Length</strong> →{" "}
              <span className="font-normal">4 Hours</span>
            </p>
            <p>
              <strong>Price</strong> →{" "}
              <span className="font-normal">$50.00</span>
            </p>
          </div>
        </div>

        {/* Imagen */}
        <Image
          src="/AC.jpg"
          alt="Traffic Law Class"
          width={400}
          height={280}
          className="rounded-xl shadow-md object-cover"
        />
      </div>

      {/* Descripción */}
      <h3 className="text-xl text-black font-semibold mt-6">Overview</h3>
      <p className="text-black">
        <em>
          Since 1990, all first-time drivers in Florida must complete the TLSAE
          - Traffic Law Substance Abuse Education Course before applying for a
          driver’s license or learner’s permit.
        </em>{" "}
        <br />
        <br />
        Take this class at our school in a fun and easy atmosphere! By taking
        this course, you will learn how alcohol and other drugs affect your
        ability to drive safely, laws and responsibilities, safe driving
        techniques, and how to increase your awareness on Florida roadways. At
        the end of the class you will be reported to the Florida DMV
        electronically; you will get a certificate of completion as proof of
        attending our class.
      </p>

      <h3 className="text-xl text-black font-semibold mt-6">
        Class Objectives
      </h3>
      <p className="text-black">
        The goal of this course is to reduce the number of persons killed and/or
        injured on Florida’s highways. The program aims to help students of all
        ages become well-informed, responsible drivers by providing them with
        accurate information about Florida laws, the effects of alcohol and
        other drugs on driving skills and techniques on how to drive defensively
        to avoid crashes.
      </p>

      {/* Llamado a la acción */}
      <p className="text-xl font-bold text-[#0056b3] mt-6">
        Call 561 330 7007 to Book Now
      </p>
    </div>
  );
};

export default TrafficLawClass;
