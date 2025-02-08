"use client";

import React from "react";
import Image from "next/image";

const Body = () => {
  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start space-y-10 lg:space-y-0 lg:space-x-16">
        {/* Texto alineado y justificado */}
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-black mb-6 leading-snug">
            BBB Accredited Driving <br className="hidden md:block" /> Traffic
            School
            <br />
            <span className="text-[#4CAF50]">With A+ Rating</span>
          </h2>
          <p className="text-lg text-black leading-relaxed max-w-xl mx-auto lg:mx-0 text-justify">
            Affordable Driving School is your leading Palm Beach provider for
            driving lessons and Florida state-approved Traffic courses.
            Affordable Driving Traffic School has been offering In-Person
            Traffic School Courses, Driving Lessons, Florida Online Traffic
            School Classes, and Now Zoom Traffic Classes to thousands of
            satisfied students in the Palm Beach County area since 1995. These
            courses are taught by Certified and Experienced Professional
            Instructors to help students improve their driving knowledge and
            safety.
          </p>
        </div>

        {/* Imagen completamente responsive */}
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
          <Image
            src="/10.jpg" // Asegúrate de que la imagen esté en el directorio correcto
            alt="Driving School"
            width={600}
            height={400}
            className="w-full h-auto object-cover rounded-lg shadow-md"
          />
        </div>
      </div>
    </section>
  );
};

export default Body;
