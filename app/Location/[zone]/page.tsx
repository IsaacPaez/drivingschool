"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LocationMap from "../LocationMap";
import Image from "next/image";

const LocationDetailPage: React.FC = () => {
  const { zone } = useParams(); // Obtiene la zona de la URL
  const [location, setLocation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const res = await fetch(`/api/locations`);
        const data = await res.json();

        // Buscar la zona específica
        const selectedLocation = data.find((loc: any) => loc.zone === decodeURIComponent(Array.isArray(zone) ? zone[0] : zone || ""));

        if (selectedLocation) {
          setLocation(selectedLocation);
        } else {
          setLocation(null);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [zone]);

  if (loading) {
    return <p className="text-center text-gray-500 text-lg">Loading location...</p>;
  }

  if (!location) {
    return <p className="text-center text-red-600 text-lg">Location not found.</p>;
  }

  return (
    <section className="bg-gray-100 pt-[150px] pb-20 px-4 sm:px-6 md:px-12 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 📌 ENCABEZADO */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6">
          Affordable Driving Traffic School at {location.zone}
        </h1>

        {/* 📌 CONTENEDOR PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          {/* 📌 INFORMACIÓN DE LA UBICACIÓN */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{location.title}</h2>
            <p className="text-gray-700 mb-2">
              <strong>Zone:</strong> {location.zone}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Phone:</strong> <span className="text-blue-600">561 330 7007</span>
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Email:</strong>{" "}
              <a href="mailto:info@drivingschoolpalmbeach.com" className="text-blue-600 underline">
                info@drivingschoolpalmbeach.com
              </a>
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Address:</strong> {location.address || "Not available"}
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Opening Hours:</strong> Monday - Sunday: 8:00am to 8:00pm
            </p>
            <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">
              See Traffic Courses
            </button>
          </div>

          {/* 📌 MAPA */}
          <LocationMap />
        </div>

        {/* 📌 INSTRUCTORES */}
        {location.instructors && location.instructors.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Instructors in {location.zone}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {location.instructors.map((instructor: string, index: number) => (
                <div key={index} className="flex flex-col items-center bg-gray-200 p-4 rounded-lg shadow">
                  <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mb-3">
                    <span className="text-gray-600 text-sm">Image Not Available</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{instructor}</p>
                  <button className="mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Book {instructor.split(" ")[0]}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LocationDetailPage;
