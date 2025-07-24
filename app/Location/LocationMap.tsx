"use client";

import React from "react";

const LocationMap: React.FC = () => {
  return (
    <div>
      {/* Main Office Location Map */}
      <iframe
        title="Affordable Driving Traffic School - Main Office"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3543.7899999999995!2d-80.0933109!3d26.6513812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d8d7e4c3b11b0f%3A0xa9dff82d70134b70!2s3167%20Forest%20Hill%20Blvd%2C%20West%20Palm%20Beach%2C%20FL%2033406%2C%20USA!5e0!3m2!1sen!2sus!4v1735034400000!5m2!1sen!2sus"
        width="100%"
        height="100%"
        style={{ minHeight: '400px' }}
        className="border-0 rounded-lg"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600 mb-2">
          <strong className="text-blue-600">Our Main Office Location</strong>
        </p>
        <p className="text-center text-sm text-blue-600">
          <a
            href="https://www.google.com/maps/place/3167+Forest+Hill+Blvd,+West+Palm+Beach,+FL+33406,+EE.+UU./@26.6513812,-80.0933109,17z/data=!3m1!4b1!4m6!3m5!1s0x88d8d7e4c3b11b0f:0xa9dff82d70134b70!8m2!3d26.6513764!4d-80.090736!16s%2Fg%2F11c2cc6gl9?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-800"
          >
            📍 Get Directions to Our Office
          </a>
        </p>
      </div>
    </div>
  );
};

export default LocationMap;
