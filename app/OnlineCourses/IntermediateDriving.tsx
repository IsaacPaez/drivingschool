"use client";

import React from "react";

const IntermediateDriving: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* 📌 Título */}
      <h2 className="text-4xl font-extrabold text-white">
        Driving Improvement (Intermediate)
      </h2>

      {/* 📌 Descripción */}
      <p className="text-lg text-gray-300">
        If the court or a judge has ordered you to take a traffic class, then
        the <strong>Florida 8 Hour Judge Ordered</strong> course is for you!
        Simply register for the course and start immediately.
      </p>

      {/* 📌 Botón */}
      <button className="bg-[#27ae60] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#0056b3] transition">
        Start Course
      </button>
    </div>
  );
};

export default IntermediateDriving;
