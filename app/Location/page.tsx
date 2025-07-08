"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import LocationMap from "./LocationMap";
import LocationModal from "./LocationModal";
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
                <LocationModal
                  isOpen={selectedZone !== null}
                  onClose={() => setSelectedZone(null)}
                >
                  <div 
                    className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] relative flex flex-col"
                    style={{
                      margin: '0',
                      padding: '0',
                      boxSizing: 'border-box'
                    }}
                  >



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

                    <div 
                      className="p-8 overflow-y-auto flex-1" 
                      style={{
                        maxHeight: 'calc(90vh - 220px)',
                        margin: '0',
                        padding: '32px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <h2 
                        className="text-4xl font-bold text-gray-900 text-center mt-4 mb-8"
                        style={{
                          margin: '16px 0 32px 0',
                          padding: '0',
                          fontSize: '2.5rem',
                          lineHeight: '1.2'
                        }}
                      >
                        {selectedZone?.title}
                      </h2>

                      <div 
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                          gap: '32px',
                          marginBottom: '32px'
                        }}
                      >
                        <div 
                          className="text-lg text-gray-700 whitespace-pre-line"
                          style={{
                            fontSize: '1.125rem',
                            lineHeight: '1.6',
                            color: '#374151'
                          }}
                        >
                          {selectedZone?.description}
                        </div>

                        <div 
                          className="p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200"
                          style={{
                            padding: '24px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <h3 
                            className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2"
                            style={{
                              fontSize: '1.5rem',
                              fontWeight: '600',
                              marginBottom: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            📍 Location Info
                          </h3>

                          <div 
                            className="space-y-4"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '16px'
                            }}
                          >
                            <p 
                              className="flex items-center gap-3 text-gray-800"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '1rem',
                                color: '#1f2937'
                              }}
                            >
                              <span className="text-red-600 text-xl">📞</span>
                              <strong>Phone:</strong>
                              <a
                                href="tel:5613307007"
                                className="text-blue-600 hover:underline"
                                style={{
                                  color: '#2563eb',
                                  textDecoration: 'none'
                                }}
                              >
                                561 330 7007
                              </a>
                            </p>

                            <p 
                              className="flex items-center gap-3 text-gray-800"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '1rem',
                                color: '#1f2937'
                              }}
                            >
                              <span className="text-purple-600 text-xl">✉️</span>
                              <strong>Email:</strong>
                              <a
                                href="mailto:info@drivingschoolpalmbeach.com"
                                className="text-blue-600 hover:underline"
                                style={{
                                  color: '#2563eb',
                                  textDecoration: 'none'
                                }}
                              >
                                info@drivingschoolpalmbeach.com
                              </a>
                            </p>
                          </div>

                          <div 
                            className="border-t pt-6 mt-6"
                            style={{
                              borderTop: '1px solid #e5e7eb',
                              paddingTop: '24px',
                              marginTop: '24px'
                            }}
                          >
                            <h3 
                              className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2"
                              style={{
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              🕒 Opening Hours
                            </h3>
                            <div 
                              className="grid grid-cols-1 gap-2 text-gray-800"
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gap: '8px',
                                fontSize: '1rem',
                                color: '#1f2937'
                              }}
                            >
                              {[
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                                "Saturday",
                                "Sunday",
                              ].map((day) => (
                                <div 
                                  key={day} 
                                  className="flex justify-between items-center py-2 px-4 bg-white rounded-lg shadow-sm border border-gray-100"
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 16px',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    border: '1px solid #f3f4f6',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                  }}
                                >
                                  <span className="font-semibold">{day}:</span>
                                  <span className="text-right font-medium text-green-600">8:00am - 8:00pm</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div 
                        className="w-full h-80 rounded-lg overflow-hidden border border-gray-300 shadow-lg mb-8"
                        style={{
                          width: '100%',
                          height: '320px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid #d1d5db',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          marginBottom: '32px'
                        }}
                      >
                        <iframe
                          src={`https://www.google.com/maps?q=${encodeURIComponent(
                            selectedZone?.zone || ""
                          )}&output=embed`}
                          width="100%"
                          height="100%"
                          allowFullScreen
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                          }}
                        ></iframe>
                      </div>

                      <div 
                        className="mt-8"
                        style={{
                          marginTop: '32px'
                        }}
                      >
                        <h3 
                          className="text-3xl font-semibold text-gray-900 text-center mb-6"
                          style={{
                            fontSize: '1.875rem',
                            fontWeight: '600',
                            textAlign: 'center',
                            marginBottom: '24px',
                            color: '#111827'
                          }}
                        >
                          Available Instructors
                        </h3>
                        <div 
                          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '24px'
                          }}
                        >
                          {Array.isArray(selectedZone?.instructorsDetails) &&
                            selectedZone.instructorsDetails.map((instructor, index) => (
                              <div 
                                key={instructor._id || `instructor-${index}`} 
                                className="text-center p-6 border rounded-lg shadow-sm bg-white flex flex-col items-center"
                                style={{
                                  textAlign: 'center',
                                  padding: '24px',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                  backgroundColor: '#ffffff',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center'
                                }}
                              >
                                <div 
                                  className="w-28 h-28 relative mb-4"
                                  style={{
                                    width: '112px',
                                    height: '112px',
                                    position: 'relative',
                                    marginBottom: '16px'
                                  }}
                                >
                                  <Image
                                    src={instructor.photo || "/default-avatar.png"}
                                    alt={instructor.name || "Instructor"}
                                    width={112}
                                    height={112}
                                    className="rounded-full border border-gray-300 shadow-sm object-cover"
                                    priority
                                    style={{
                                      borderRadius: '50%',
                                      border: '1px solid #d1d5db',
                                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                      objectFit: 'cover'
                                    }}
                                  />
                                </div>
                                <p 
                                  className="text-gray-900 mt-2 font-semibold text-center min-h-[3rem] flex items-center justify-center"
                                  style={{
                                    color: '#111827',
                                    marginTop: '8px',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    minHeight: '3rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {instructor.name || "Instructor Name Missing"}
                                </p>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleBookNow(instructor.name || "Unknown Instructor");
                                  }}
                                  className="mt-auto w-full max-w-[180px] h-[60px] bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition flex flex-col justify-center items-center cursor-pointer"
                                  style={{
                                    marginTop: 'auto',
                                    width: '100%',
                                    maxWidth: '180px',
                                    height: '60px',
                                    backgroundColor: '#16a34a',
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transition: 'background-color 0.2s'
                                  }}
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
                </LocationModal>
              )}
            </>
          )
        )}
      </div>
    </section>
  );
};

export default LocationPage;
