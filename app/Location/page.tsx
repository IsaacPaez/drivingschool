"use client";

import React from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("./LocationMap"), { ssr: false });

const locations = [
  {
    name: "West Palm Beach",
    address: "3167 Forest Hill Blvd, West Palm Beach, Florida 33406",
    phone: "561 330 7007",
    email: "info@drivingschoolpalmbeach.com",
    hours: "8:00am to 8:00pm",
  },
  {
    name: "Boca Raton",
    address: "1234 Boca Raton Ave, Boca Raton, Florida 33431",
    phone: "561 123 4567",
    email: "info@bocadrivingschool.com",
    hours: "8:00am to 8:00pm",
  },
];

const LocationPage = () => {
  return (
    <section className="py-12 px-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
        Find Our Driving Schools
      </h1>
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Location Details */}
        <div className="space-y-6">
          {locations.map((location, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-blue-700 mb-2">
                {location.name}
              </h2>
              <p className="flex items-center gap-2 text-gray-700">
                <FaMapMarkerAlt className="text-blue-500" /> {location.address}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <FaPhone className="text-blue-500" /> {location.phone}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <FaEnvelope className="text-blue-500" /> {location.email}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <FaClock className="text-blue-500" /> {location.hours}
              </p>
            </div>
          ))}
          <button className="bg-blue-700 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-800 transition w-full">
            Book Now
          </button>
        </div>
        {/* Location Map */}
        <div className="w-full md:w-[80%] flex justify-end">
          <LocationMap />
        </div>
      </div>
    </section>
  );
};

export default LocationPage;
