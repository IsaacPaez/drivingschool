"use client";

import React from "react";

const SeniorInsurance: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* 📌 Título */}
      <h2 className="text-4xl font-extrabold text-white">
        Senior Insurance Discount
      </h2>

      {/* 📌 Descripción */}
      <p className="text-lg text-gray-300">
        Online state-approved <strong>mature driver course.</strong> Upon
        completion, you will receive an{" "}
        <strong>insurance reduction certificate</strong> that you will submit to
        your insurer to apply your discount, which lasts up to{" "}
        <strong>3 years!</strong>
      </p>

      {/* 📌 Botón */}
      <button className="bg-[#27ae60] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#0056b3] transition">
        Start Course
      </button>
    </div>
  );
};

export default SeniorInsurance;
