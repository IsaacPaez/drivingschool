"use client";

import React, { useState, useEffect } from "react";
import LocationMap from "./LocationMap";

const LocationPage: React.FC = () => {
  const [location, setLocation] = useState<any | null>(null);
  const [zones, setZones] = useState<string[]>([]);
  const [showZones, setShowZones] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch("/api/locations");
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setLocation(data[0]);
          setZones(data.map((loc) => loc.zone));
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return (
    <section className="bg-gray-100 pt-[150px] pb-20 px-4 sm:px-6 md:px-12 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading location...</p>
        ) : (
          location && (
            <>
              {/* 📌 ENCABEZADO */}
              <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6">
                {location.title}
              </h1>

              {/* 📌 CONTENEDOR PRINCIPAL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 📌 INFORMACIÓN DE LA UBICACIÓN */}
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{location.title}</h2>
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
                    <strong>Address:</strong> Boca Raton, FL
                  </p>
                  <p className="text-gray-700 mb-4">
                    <strong>Opening Hours:</strong> Monday - Sunday: 8:00am to 8:00pm
                  </p>
                  <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">
                    Book Now
                  </button>
                </div>

                {/* 📌 MAPA */}
                <LocationMap />
              </div>

              {/* 📌 BOTÓN PARA VER ZONAS */}
              <div className="text-center mt-10">
                <button
                  onClick={() => setShowZones(!showZones)}
                  className="text-blue-600 underline text-lg font-semibold"
                >
                  {showZones ? "Hide Areas" : "View all Areas Covered"}
                </button>
              </div>

              {/* 📌 LISTA DE ZONAS */}
              {showZones && (
                <div className="mt-6 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Covered Areas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-blue-600">
                    {zones.map((zone, index) => (
                      <p key={index} className="underline cursor-pointer hover:text-blue-800">
                        {zone}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>
    </section>
  );
};

export default LocationPage;
