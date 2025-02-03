"use client";

import React, { useState, useEffect } from "react";
import LocationMap from "./LocationMap";
import Modal from "@/components/Modal";

const LocationPage: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [showZones, setShowZones] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("/api/locations");
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setLocations(data);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const openModal = (zone: any) => {
    setSelectedZone(zone);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedZone(null);
  };

  return (
    <section className="bg-gray-100 pt-[150px] pb-20 px-4 sm:px-6 md:px-12 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading location...</p>
        ) : (
          <>
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
                  {locations.map((loc) => (
                    <button
                      key={loc._id}
                      onClick={() => openModal(loc)}
                      className="underline cursor-pointer hover:text-blue-800"
                    >
                      {loc.zone}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 📌 MODAL PARA MOSTRAR DETALLES */}
            {isModalOpen && selectedZone && (
              <Modal onClose={closeModal}>
                <div className="p-6">
                  {/* 📌 ENCABEZADO */}
                  <h2 className="text-4xl font-bold text-gray-900 mb-4 uppercase">
                    <span className="text-red-600">AFFORDABLE DRIVING</span>{" "}
                    <span className="text-black">SCHOOL AT</span>{" "}
                    <span className="text-green-600">{selectedZone.zone}</span>
                  </h2>

                  {/* 📌 CONTENIDO PRINCIPAL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 📌 IMAGEN Y DESCRIPCIÓN */}
                    <div>
                      {selectedZone.locationImage && (
                        <img
                          src={selectedZone.locationImage}
                          alt={selectedZone.title}
                          className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                      )}

                      <p className="text-gray-700 leading-relaxed mb-4">{selectedZone.description}</p>

                      <p className="text-gray-700 mb-2">
                        <strong>Zone:</strong> {selectedZone.zone}
                      </p>
                      <p className="text-gray-700 mb-2">
                        <strong>Phone:</strong>{" "}
                        <a href={`tel:${selectedZone.phone}`} className="text-blue-600 underline">
                          {selectedZone.phone || "Not available"}
                        </a>
                      </p>
                      <p className="text-gray-700 mb-2">
                        <strong>Email:</strong>{" "}
                        <a href={`mailto:${selectedZone.email}`} className="text-blue-600 underline">
                          {selectedZone.email || "Not available"}
                        </a>
                      </p>
                      <p className="text-gray-700 mb-4">
                        <strong>Address:</strong> {selectedZone.address || "Not available"}
                      </p>
                      <p className="text-gray-700 mb-4">
                        <strong>Opening Hours:</strong> Monday - Sunday: 8:00am to 8:00pm
                      </p>

                      {/* 📌 BOTÓN DE CURSOS */}
                      <button className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition">
                        See Traffic Courses
                      </button>
                    </div>

                    {/* 📌 MAPA */}
                    <div className="h-64">
                      <LocationMap />
                    </div>
                  </div>

                  {/* 📌 INSTRUCTORES */}
                  {selectedZone.instructors && selectedZone.instructors.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-2xl font-bold mb-4">
                        Instructors in {selectedZone.zone}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {selectedZone.instructors.map((instructor: any, index: number) => (
                          <div key={index} className="text-center">
                            <img
                              src={
                                instructor.image ||
                                "https://via.placeholder.com/150?text=Image+Not+Available"
                              }
                              alt={instructor.name}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                            <p className="font-semibold">{instructor.name}</p>
                            <button className="mt-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                              Book {instructor.name.split(" ")[0]}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 📌 BOTÓN DE CIERRE */}
                  <button
                    onClick={closeModal}
                    className="mt-6 w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition"
                  >
                    Close
                  </button>
                </div>
              </Modal>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default LocationPage;
