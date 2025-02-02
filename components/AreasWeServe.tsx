"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const AreasWeServe = () => {
  // Lista de todas las áreas
  const areas = [
    ["Lake Park", "Boynton Beach", "Haverhill", "Palm Springs", "West Palm Beach", "Lake Worth", "Wellington", "Highland Beach"],
    ["Lantana", "Greenacres", "Royal Palm Beach", "Delray Beach", "South Palm Beach", "Boca Raton", "City of Atlantis"],
    ["Riviera Beach", "Jupiter", "Palm Beach Gardens", "Lake Clarke Shores", "Loxahatchee Groves", "North Palm Beach", "Manalapan"],
  ];

  // Definir las rutas de cada área dinámicamente
  const areaLinks: Record<string, string> = {
    "Lake Park": "/areas/LakePark",
    "Boynton Beach": "/areas/BoyntonBeach",
    "Haverhill": "/areas/Haverhill",
    "Palm Springs": "/areas/PalmSprings",
    "West Palm Beach": "/areas/WestPalm",
    "Lake Worth": "/areas/LakeWorth",
    "Wellington": "/areas/Wellington",
    "Highland Beach": "/areas/HighlandBeach",
    "Lantana": "/areas/Lantana",
    "Greenacres": "/areas/Greenacres",
    "Royal Palm Beach": "/areas/RoyalPalm",
    "Delray Beach": "/areas/DelrayBeach",
    "South Palm Beach": "/areas/SouthPalm",
    "Boca Raton": "/areas/BocaRaton",
    "City of Atlantis": "/areas/CityOfAtlantis",
    "Riviera Beach": "/areas/RivieraBeach",
    "Jupiter": "/areas/Jupiter",
    "Palm Beach Gardens": "/areas/PalmBGardens",
    "Lake Clarke Shores": "/areas/LakeClarkeS",
    "Loxahatchee Groves": "/areas/Loxahatchee",
    "North Palm Beach": "/areas/NorthPalmB",
    "Manalapan": "/areas/Manalapan",
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center lg:items-start space-y-10 lg:space-y-0 lg:space-x-10">
        
        {/* Texto */}
        <div className="lg:w-2/3 text-center lg:text-left">
          <h2 className="text-4xl font-extrabold text-black mb-6">
            Areas We Serve
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            We are dedicated to providing world-class driving school services to West Palm Beach and surrounding areas.
          </p>

          {/* Grid de áreas */}
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
                    {areaLinks[area] ? (
                      <Link href={areaLinks[area]} className="text-blue-600 hover:underline">
                        {area}
                      </Link>
                    ) : (
                      area
                    )}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Imagen */}
        <div className="lg:w-1/3 flex justify-center">
          <Image src="/Flo.jpg" alt="Florida Map" width={500} height={500} className="object-contain" />
        </div>

      </div>
    </section>
  );
};

export default AreasWeServe;
