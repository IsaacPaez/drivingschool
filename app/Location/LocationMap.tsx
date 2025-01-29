"use client";

import React from "react";

const LocationMap: React.FC = () => {
  return (
    <div className="w-full md:w-3/4 h-96 rounded-lg overflow-hidden shadow-lg">
      <iframe
        title="Driving School Locations"
        src="https://www.google.com/maps/d/u/0/embed?mid=17fL0-npFO8UAPBJw1y2o-6wNpus9FNE&ehbc=2E312F"
        width="100%"
        height="100%"
        className="border-0"
        allowFullScreen
      ></iframe>
      <p className="text-center text-sm text-blue-600 mt-2">
        <a
          href="https://www.google.com/maps/d/u/0/viewer?mid=1OvPZJhJgxKQ8vB2t_YWvZ6CwPGE&hl=en&ll=26.704&z=10"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Open in Google Maps
        </a>
      </p>
    </div>
  );
};

export default LocationMap;
