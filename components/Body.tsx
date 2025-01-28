"use client";

import React from "react";
import Image from "next/image";

const Body = () => {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center lg:items-start space-y-10 lg:space-y-10 lg:space-x-10">
        {/* Texto */}
        <div className="flex-1 mt-12">
          <h2 className="text-5xl font-extrabold text-black mb-5 leading-snug">
            BBB Accredited Driving <br /> Traffic School
            <br />
            <span className="text-[#4CAF50]">With A+ Rating</span>
          </h2>
          <p className="text-base text-black leading-relaxed">
            Affordable Driving School is your leading Palm Beach provider for
            driving <br />lessons and Florida state-approved Traffic courses.
            Affordable Driving <br /> Traffic School has been offering
            In-Person Traffic School Courses, Driving <br />Lessons, Florida
            Online Traffic School Classes, and Now Zoom Traffic <br />Classes
            to thousands of satisfied students in the Palm Beach County <br />
            area since 1995. These courses are taught by Certified and
            Experienced <br />Professional Instructors to help students improve
            their driving knowledge<br /> and safety.
          </p>
        </div>

        {/* Imagen */}
        <div className="flex-row ml-28">
          <div className="rounded-lg overflow-hidden" style={{ marginTop: "40px" }}> {/* Bajar imagen */}
            <Image
              src="/10.jpg" // Reemplaza por el path correcto
              alt="Driving School"
              width={550}
              height={225}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Body;
