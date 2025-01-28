"use client";

import React from "react";
import Image from "next/image";

const AreasWeServe = () => {
  const areas = [
    ["Lake Park", "Boynton Beach", "Haverhill", "Palm Springs", "West Palm Beach", "Lake Worth", "Wellington", "Highland Beach"],
    ["Lantana", "Greenacres", "Royal Palm Beach", "Delray Beach", "South Palm Beach", "Boca Raton", "City of Atlantis"],
    ["Riviera Beach", "Jupiter", "Palm Beach Gardens", "Lake Clarke Shores", "Loxahatchee Groves", "North Palm Beach", "Manalapan"],
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center lg:items-start space-y-10 lg:space-y-0 lg:space-x-10">
        {/* Text Section */}
        <div className="lg:w-2/3 text-center lg:text-left">
          <h2 className="text-4xl font-extrabold text-black mb-6">
            Areas we serve
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            We are dedicated to providing world-class driving school services to West Palm Beach and surrounding areas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {areas.map((column, index) => (
              <div key={index} className="space-y-3">
                {column.map((area, idx) => (
                  <p
                    key={idx}
                    className={`text-lg ${
                      idx % 2 === 0 ? "text-[#27ae60] font-bold" : "text-black font-semibold"
                    }`}
                  >
                    {area}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Image Section */}
        <div className="lg:w-1/3 flex justify-center">
          <Image
            src="/Flo.jpg" // Cambia por el path correcto de tu imagen
            alt="Florida Map"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default AreasWeServe;
