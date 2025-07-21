"use client";

import React from "react";

const LocationMap: React.FC = () => {
  return (
    <div>
      <iframe
        title="Driving School Locations"
        src="https://www.google.co.nz/maps/d/embed?mid=1YX9aMhL_FOvws9x6haE02QOE_mYtvpYQ&ehbc=2E312F"
        width="100%"
        height="100%"
        style={{ minHeight: '700px' }}
        className="border-0"
        allowFullScreen
      ></iframe>
      <p className="text-center text-sm text-blue-600 mt-2">
        <a
          href="https://www.google.com/maps/place/3167+Forest+Hill+Blvd,+West+Palm+Beach,+FL+33406,+EE.+UU./@26.6513812,-80.0933109,17z/data=!3m1!4b1!4m6!3m5!1s0x88d8d7e4c3b11b0f:0xa9dff82d70134b70!8m2!3d26.6513764!4d-80.090736!16s%2Fg%2F11c2cc6gl9?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D"
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
