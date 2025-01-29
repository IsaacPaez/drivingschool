"use client";

import React from "react";

const BasicDriving: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* 📌 Título */}
      <h2 className="text-4xl font-extrabold text-white">
        Driving Improvement (Basic)
      </h2>

      {/* 📌 Descripción */}
      <p className="text-lg text-gray-300">
        4 hours <strong>BDI & TCAC</strong>. You may need this course if you
        would like to:
      </p>

      {/* 📌 Beneficios */}
      <ul className="list-disc list-inside text-gray-300 space-y-1">
        <li>Remove traffic ticket points</li>
        <li>Avoid insurance premium increases</li>
        <li>Fulfill a court order or State-mandated course</li>
      </ul>

      {/* 📌 Botón */}
      <button className="bg-[#27ae60] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#0056b3] transition">
        Start Course
      </button>
    </div>
  );
};

export default BasicDriving;
