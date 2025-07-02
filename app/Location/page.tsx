"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import LocationMap from "./LocationMap";
import Modal from "@/components/Modal";
import { useRouter } from 'next/navigation';

interface Instructor {
  _id: string;
  name: string;
  photo?: string;
}

interface Zone {
  _id: string;
  title: string;
  zone: string;
  locationImage?: string;
  description?: string;
  instructors?: Instructor[];
  instructorsDetails?: Instructor[];
}

const LocationPage: React.FC = () => {
  const [location, setLocation] = useState<Zone | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [showZones, setShowZones] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleBookNow = (instructorName: string) => {
    console.log('Navegando a Book-Now para instructor:', instructorName);
    setSelectedZone(null); // Cerrar el modal
    router.push('/Book-Now');
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch("/api/locations");
        
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
    
        const data: Zone[] = await res.json();
    
        if (data.length > 0) {
          setLocation(data[0]); // 📌 Verifica que esto se ejecuta
          setZones(data);
        }
      } catch (error) {
        console.error("❌ Error fetching location data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    

    fetchLocation();
  }, []);

  const fetchInstructorsDetails = async (instructorIds: string[]) => {
    if (!instructorIds || instructorIds.length === 0) {
      console.warn("⚠️ No instructor IDs provided.");
      return [];
    }
  
    try {
      const instructorDetails = await Promise.all(
        instructorIds.map(async (id) => {
          const res = await fetch(`/api/instructors/${id}`);
  
          if (!res.ok) {
            console.error(`❌ Invalid response for instructor ${id}, Status: ${res.status}`);
            return { _id: id, name: "Unknown Instructor", photo: "/default-avatar.png" };
          }
  
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            console.error(`❌ Response for instructor ${id} is not JSON.`);
            return { _id: id, name: "Unknown Instructor", photo: "/default-avatar.png" };
          }
  
          return await res.json();
        })
      );
  
      return instructorDetails;
    } catch (error) {
      console.error("❌ Error fetching instructors:", error);
      return [];
    }
  };
  


  const handleZoneClick = async (zone: Zone) => {
    if (!zone.instructors || zone.instructors.length === 0) {
      setSelectedZone({ ...zone, instructorsDetails: [] });
      return;
    }
  
    const instructorIds = zone.instructors.map(instructor => instructor._id);
  
    const instructorsData = await fetchInstructorsDetails(instructorIds);
  
    setSelectedZone({ ...zone, instructorsDetails: instructorsData });
  };
  

  return (
    <section className="bg-gray-100 pt-[150px] pb-20 px-4 sm:px-6 md:px-12 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading location...</p>
        ) : (
          location && (
            <>
              {/* Sección superior con el mapa y la información */}
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2 flex items-center">
                  <div className="w-full h-64 md:h-[400px] rounded-lg overflow-hidden">
                    <LocationMap />
                  </div>
                </div>

                <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {location.title}
                  </h2>
                  <div className="text-gray-700 mb-4">
                    <p>
                      <strong>Phone:</strong>{" "}
                      <span className="text-blue-600 font-bold">561 330 7007</span>
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      <a
                        href="mailto:info@drivingschoolpalmbeach.com"
                        className="text-blue-600 underline"
                      >
                        info@drivingschoolpalmbeach.com
                      </a>
                    </p>
                    <p>
                      <strong>Address:</strong> 3167 Forest Hill Blvd, West Palm Beach,
                      Florida 33406
                    </p>
                  </div>
                  <div className="text-gray-900 grid grid-cols-2 gap-x-8">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day, index) => (
                      <p key={index} className="flex justify-between w-full">
                        <strong>{day}:</strong>
                        <span>8:00am - 8:00pm</span>
                      </p>
                    ))}
                  </div>
                  <button className="mt-8 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition" onClick={() => window.location.href = '/Book-Now'}>
                    Book Now
                  </button>
                </div>
              </div>

              {/* Botón para mostrar/ocultar zonas */}
              <div className="text-center mt-10">
                <button
                  onClick={() => setShowZones(!showZones)}
                  className="text-blue-600 underline text-lg font-semibold"
                >
                  {showZones ? "Hide Areas" : "View all Areas Covered"}
                </button>
              </div>

              {/* Listado de zonas cubiertas */}
              {showZones && (
                <div className="mt-6 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Covered Areas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-blue-600">
                    {zones.map((zone, index) => (
                      <button key={zone._id || `zone-${index}`} onClick={() => handleZoneClick(zone)} className="underline cursor-pointer hover:text-blue-800">
                        {zone.zone}
                      </button>

                    ))}

                  </div>
                </div>
              )}

              {/* Modal para mostrar la zona seleccionada */}
              {selectedZone && (
                <Modal
                  isOpen={selectedZone !== null}
                  onClose={() => setSelectedZone(null)}
                >
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl sm:max-w-6xl max-h-[90vh] relative flex flex-col">



                    {selectedZone?.locationImage && (
                      <div className="w-full flex items-center justify-center pt-8 pb-2 bg-white sticky top-0 z-10">
                        <div className="w-48 h-48 relative">
                          <Image
                            src={selectedZone.locationImage}
                            alt={selectedZone.title}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      </div>
                    )}

                    <div className="p-6 overflow-y-auto flex-1" style={{maxHeight: 'calc(90vh - 220px)'}}>
                      <h2 className="text-3xl font-bold text-gray-900 text-center mt-4 mb-6">
                        {selectedZone?.title}
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <p className="text-lg text-gray-700 whitespace-pre-line">
                          {selectedZone?.description}
                        </p>

                        <div className="p-5 bg-gray-50 rounded-lg shadow-md border border-gray-200">
                          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            📍 Location Info
                          </h3>

                          <div className="space-y-3">
                            <p className="flex items-center gap-2 text-gray-800 text-sm">
                              <span className="text-red-600 text-lg">📞</span>
                              <strong>Phone:</strong>
                              <a
                                href="tel:5613307007"
                                className="text-blue-600 hover:underline"
                              >
                                561 330 7007
                              </a>
                            </p>

                            <p className="flex items-center gap-2 text-gray-800 text-sm">
                              <span className="text-purple-600 text-lg">✉️</span>
                              <strong>Email:</strong>
                              <a
                                href="mailto:info@drivingschoolpalmbeach.com"
                                className="text-blue-600 hover:underline"
                              >
                                info@drivingschoolpalmbeach.com
                              </a>
                            </p>
                          </div>

                          <div className="border-t pt-4 mt-4">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              🕒 Opening Hours
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 text-gray-800 text-sm">
                              {[
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                                "Saturday",
                                "Sunday",
                              ].map((day) => (
                                <div key={day} className="flex justify-between border-b pb-1">
                                  <span className="font-semibold">{day}:</span>
                                  <span className="text-right">8:00am - 8:00pm</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden border border-gray-300 shadow-md mt-6">
                        <iframe
                          src={`https://www.google.com/maps?q=${encodeURIComponent(
                            selectedZone?.zone || ""
                          )}&output=embed`}
                          width="100%"
                          height="100%"
                          allowFullScreen
                          loading="lazy"
                        ></iframe>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-2xl font-semibold text-gray-900 text-center mb-4">
                          Instructors
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {Array.isArray(selectedZone?.instructorsDetails) &&
                            selectedZone.instructorsDetails.map((instructor, index) => (
                              <div key={instructor._id || `instructor-${index}`} className="text-center p-4 border rounded-lg shadow-sm bg-white flex flex-col items-center">
                                <div className="w-24 h-24 relative">
                                  <Image
                                    src={instructor.photo || "/default-avatar.png"} // 👈 Usar "photo" en lugar de "image"
                                    alt={instructor.name || "Instructor"}
                                    width={96}
                                    height={96}
                                    className="rounded-full border border-gray-300 shadow-sm object-cover"
                                    priority
                                  />
                                </div>
                                <p className="text-gray-900 mt-2 font-semibold text-center min-h-[3rem] flex items-center justify-center">
                                  {instructor.name || "Instructor Name Missing"}
                                </p>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleBookNow(instructor.name || "Unknown Instructor");
                                  }}
                                  className="mt-auto w-full max-w-[160px] h-[50px] bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition flex flex-col justify-center items-center cursor-pointer"
                                >
                                  <span>Book</span>
                                  <span>{instructor.name ? instructor.name.split(" ")[0] : "No Name"}</span>
                                </button>
                              </div>
                            ))}

                        </div>
                      </div>
                    </div>
                  </div>
                </Modal>
              )}
            </>
          )
        )}
      </div>
    </section>
  );
};

export default LocationPage;
