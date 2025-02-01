"use client";

import React from "react";
import Image from "next/image";
import { FaClock, FaDollarSign } from "react-icons/fa";

const ADIClass: React.FC = () => {
  return (
    <section className="py-12 px-6">
      {/* 🔹 Contenedor Principal con imagen a la izquierda */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start gap-8">
        {/* 📌 Imagen a la izquierda con tamaño ajustado */}
        <div className="w-full md:w-[300px] flex flex-col items-center">
          <Image
            src="/avanzado.jpg"
            alt="ADI Class"
            width={300}
            height={180}
            className="rounded-lg shadow-md w-full"
          />

          {/* 📌 Length y Price alineados correctamente en una sola línea */}
          <div className="flex justify-between w-full mt-4 text-black font-semibold">
            <p className="flex items-center gap-2 whitespace-nowrap">
              <FaClock className="text-[#0056b3]" /> <strong>Length:</strong> 12 Hours
            </p>
            <p className="flex items-center gap-2 whitespace-nowrap">
              <FaDollarSign className="text-[#27ae60]" /> <strong>Price:</strong> $100.00
            </p>
          </div>
        </div>

        {/* 📌 Información a la derecha */}
        <div className="w-full flex-1 text-left">
          {/* 📌 Título */}
          <h2 className="text-3xl font-extrabold text-[#222]">
            <span className="text-[#0056b3]">12 hr (ADI)</span> <br />
            Advanced Driving Improvement Class
          </h2>

          {/* 📌 Botón con más separación del título */}
          <button className="bg-[#27ae60] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#0056b3] transition mt-8">
            See all Class Dates
          </button>

          {/* 📌 Also known as con más separación del botón */}
          <h3 className="text-lg font-semibold text-black mt-14 mb-3">Also known as</h3>
          <ul className="list-disc list-inside text-black">
            <li>Advanced Driving Improvement Course</li>
            <li>12 Hours ADI</li>
            <li>12 Hours Court Ordered Suspended License</li>
            <li>12 - 18 - 24 Points Course</li>
            <li>Habitual Traffic Offender Course</li>
          </ul>
        </div>
      </div>

      {/* 🔹 Descripción alineada */}
      <div className="max-w-4xl mx-auto mt-8 space-y-6">
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-[#222] mb-4">Overview</h3>

          <div className="bg-gray-200 p-4 rounded-md text-base font-semibold italic text-gray-800">
            🏛 If a Florida Court or Judge ordered you to take the{" "}
            <strong>12 Hour Traffic Course in-person</strong>, this is the
            course you need to attend.
          </div>

          <p className="text-black mt-4 leading-relaxed text-justify">
  If your license suspension has ended, you may be{" "}
  <strong>eligible to reinstate your Driver’s License today</strong>. Just{" "}
  <strong>call us, enroll, and obtain proof of enrollment</strong> to complete 
  the class at our{" "}
  <span className="text-[#0056b3] font-semibold">West Palm Beach location</span> 
  within <strong>90 days</strong>.  
</p>

<p className="text-black mt-4 leading-relaxed text-justify">
  You may also need this course if you{" "}
  <strong>disputed a traffic ticket in court</strong> and the{" "}
  <span className="text-[#0056b3] font-semibold">Judge or Hearing Officer</span> 
  ordered you to attend a{" "}
  <strong>12-hour ADI Court Ordered Course</strong> as part of your judgment. 
  This course is{" "}
  <span className="text-[#0056b3] font-semibold">approved by the Florida DHSMV</span> 
  and accepted in <strong>all Florida Courts</strong>.
</p>

<p className="text-black mt-4 leading-relaxed text-justify">
  Additionally, if your license was{" "}
  <strong>revoked for being a Habitual Traffic Offender (HTO)</strong>, you must 
  take this course.{" "}
  <span className="text-[#0056b3] font-semibold">HTO status leads to a 5-year revocation</span>, 
  but after <strong>one year</strong>, you may apply for a{" "}
  <span className="text-[#0056b3] font-semibold">hardship license</span> through the{" "}
  <strong>Bureau of Administrative Reviews</strong>.
</p>

<p className="text-black mt-4 font-semibold text-justify">
  🔹 Proof of enrollment in an{" "}
  <span className="text-[#0056b3] font-semibold">ADI course</span> is{" "}
  <span className="text-[#27ae60] font-semibold">required</span> to apply for a{" "}
  <strong>Florida Hardship License</strong>.
</p>

        </div>

        {/* 📌 Llamado a la acción */}
        <h3 className="text-xl text-black font-semibold mt-6 text-center">
          Upcoming 12hr Court Ordered ADI Advanced Driving Improvement Class
        </h3>
        <p className="text-xl font-bold text-[#0056b3] text-center">
          Call 561 330 7007 to Book Now
        </p>
      </div>
    </section>
  );
};

export default ADIClass;
