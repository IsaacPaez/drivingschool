"use client";

import React from "react";

const LawSubstance: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-4xl font-extrabold text-white">
        Law & Substance Abuse
      </h2>
      <p className="text-lg text-gray-300">
        All first time drivers trying to obtain a Florida learner's permit or a
        Florida driver's license must take this course.
      </p>
      <button className="bg-[#27ae60] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#0056b3] transition">
        Start Course
      </button>
    </div>
  );
};

export default LawSubstance;
