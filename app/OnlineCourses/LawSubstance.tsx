"use client";

import React from "react";
import Link from "next/link";

const LawSubstance: React.FC = () => {
  return (
    <div className="text-black px-6 md:px-12">
      {/* 📌 Contenedor de contenido */}
      <h2 className="text-5xl font-extrabold">Law & Substance Abuse</h2>
      <p className="text-lg text-black font-bold mt-2">
        All first-time drivers trying to obtain a Florida learner’s permit or
        driver’s license must take this course.
      </p>

      {/* 📌 Enlace y botón alineados */}
      <div className="flex gap-6 mt-4">
        <Link href="/Classes">
          <span className="text-black font-semibold hover:underline cursor-pointer">
            View Details
          </span>
        </Link>

        <button className="bg-[#0056b3] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#27ae60] transition">
          Start Course
        </button>
      </div>
    </div>
  );
};

export default LawSubstance;
