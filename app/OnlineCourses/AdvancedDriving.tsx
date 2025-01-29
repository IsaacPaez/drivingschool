"use client";

import React from "react";

const AdvancedDriving: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* 📌 Título */}
      <h2 className="text-4xl font-extrabold text-white">
        Driving Improvement (Advanced)
      </h2>

      {/* 📌 Descripción */}
      <p className="text-lg text-gray-300">
        <strong>Driver's License Suspended or Revoked?</strong> No class to
        attend! Take up to <strong>90 days</strong> to complete the course
        online. Go on and offline as often as you desire! Our course includes
        everything you need!
      </p>

      {/* 📌 Botón */}
      <button className="bg-[#27ae60] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#0056b3] transition">
        Start Course
      </button>
    </div>
  );
};

export default AdvancedDriving;
