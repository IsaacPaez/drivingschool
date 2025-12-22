"use client";

import React, { useState, useEffect } from "react";
import LoadingSpinner from './common/LoadingSpinner';
import { useRouter } from 'next/navigation';
import LocationMap from "@/app/locations/LocationMap";

// Definir interfaces
interface Area {
  _id: string;
  slug?: string;
  title: string;
  zone: string;
  locationImage?: string;
  description?: string;
}

const AreasWeServe = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await fetch("/api/locations");
        const data = await res.json();
        if (Array.isArray(data)) {
          setAreas(data);
        }
      } catch (error) {
        console.error("Error fetching areas:", error);
      }
    };
    fetchAreas();
  }, []);

  const totalPages = Math.ceil(areas.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAreas = areas.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  // Fondo blanco puro y layout premium
  return (
    <section className="bg-white py-20 w-full min-h-[70vh]">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12 px-4 lg:px-8" style={{ maxWidth: '1600px' }}>
        <div className="w-full flex flex-col items-center text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Areas We Serve</h2>
          <p className="text-lg text-gray-700 mb-10 max-w-2xl">We are dedicated to providing world-class driving school services throughout Palm Beach County and surrounding areas.</p>
        </div>

        <div className="w-full flex flex-col lg:flex-row items-start gap-12">
          <div className="lg:w-2/3 w-full">

            {/* Solo una zona: Boca Raton premium card */}
            {areas.length === 1 && (
              <div className="w-full flex flex-col items-center lg:items-start">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10 w-full max-w-2xl mb-8 flex flex-col items-start gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 lg:ml-0 lg:mr-auto group cursor-pointer">
                  {/* SVG pin premium */}
                  <div className="mb-2">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform duration-300">
                      <circle cx="16" cy="16" r="15" fill="#F5F6FA" stroke="#1A7F5A" strokeWidth="2" />
                      <path d="M16 8C12.6863 8 10 10.6863 10 14C10 18.25 16 24 16 24C16 24 22 18.25 22 14C22 10.6863 19.3137 8 16 8Z" fill="#1A7F5A" />
                      <circle cx="16" cy="14" r="3" fill="white" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#1A7F5A] mb-2 tracking-tight group-hover:text-[#27ae60] transition-colors duration-300">Boca Raton, FL</h3>
                  <p className="text-gray-700 text-base leading-relaxed mb-4">{areas[0].description}</p>
                  <button
                    className="flex items-center gap-2 border-2 border-[#27ae60] text-[#27ae60] font-bold py-3 px-8 rounded-full bg-white shadow hover:bg-green-50 hover:shadow-lg hover:border-[#1A7F5A] hover:scale-105 transition-all duration-300 text-lg mt-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                    onClick={() => {
                      const locationSlug = areas[0].slug || areas[0]._id;
                      router.push(`/locations/${locationSlug}`);
                    }}
                  >
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2} style={{ minWidth: '1.5rem' }}>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z' />
                    </svg>
                    More Details
                  </button>
                </div>
              </div>
            )}

            {/* Si hay varias zonas, mostrar como carrusel con 4 a la vez */}
            {areas.length > 1 && (
              <div className="w-full relative">
                {/* Contenedor del carrusel */}
                <div className="relative">
                  {/* Flecha izquierda */}
                  {totalPages > 1 && currentPage > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="absolute -left-8 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-xl border-2 border-[#27ae60] hover:bg-green-50 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                      aria-label="Previous locations"
                    >
                      <svg className="w-6 h-6 text-[#27ae60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Grid de 4 ubicaciones (2x2) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full min-h-[540px] items-start">
                    {currentAreas.map((area) => (
                      <div
                        key={area._id}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group h-[260px] w-full"
                        onClick={() => {
                          const locationSlug = area.slug || area._id;
                          router.push(`/locations/${locationSlug}`);
                        }}
                      >
                        <div className="w-12 h-12 mb-3 flex items-center justify-center bg-[#F5F6FA] rounded-full group-hover:bg-green-100 transition">
                          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="15" fill="#F5F6FA" stroke="#1A7F5A" strokeWidth="2" />
                            <path d="M16 8C12.6863 8 10 10.6863 10 14C10 18.25 16 24 16 24C16 24 22 18.25 22 14C22 10.6863 19.3137 8 16 8Z" fill="#1A7F5A" />
                            <circle cx="16" cy="14" r="3" fill="white" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#1A7F5A] mb-2 text-center leading-tight">{area.zone}</h3>
                        <p className="text-gray-600 text-sm text-center mb-4 flex-grow leading-relaxed line-clamp-3 overflow-hidden">
                          {area.description || 'Driving lessons available here.'}
                        </p>
                        <button className="mt-auto flex items-center gap-2 border-2 border-[#27ae60] text-[#27ae60] font-bold py-2 px-6 rounded-full bg-white shadow hover:bg-green-50 hover:shadow-lg hover:border-[#1A7F5A] hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 text-sm">
                          <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2} style={{ minWidth: '1rem' }}>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z' />
                          </svg>
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Flecha derecha */}
                  {totalPages > 1 && currentPage < totalPages - 1 && (
                    <button
                      onClick={handleNext}
                      className="absolute -right-8 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-xl border-2 border-[#27ae60] hover:bg-green-50 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                      aria-label="Next locations"
                    >
                      <svg className="w-6 h-6 text-[#27ae60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Indicadores de página */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentPage
                          ? 'bg-[#27ae60] scale-125'
                          : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        aria-label={`Go to page ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Loading */}
            {areas.length === 0 && (
              <div className="flex justify-center w-full mt-8">
                <LoadingSpinner label="Loading areas..." />
              </div>
            )}
          </div>

          {/* Mapa premium alineado con bordes mejorados para móvil */}
          <div className="lg:w-1/3 w-full flex justify-center mb-8 lg:mb-0 px-4 lg:px-0">
            <div className="w-full max-w-[1200px] lg:min-w-[400px] rounded-3xl overflow-hidden shadow-xl border-4 border-gray-200 bg-white" style={{ height: '600px', display: 'flex', alignItems: 'stretch' }}>
              <div style={{ width: '100%', height: '100%', padding: '8px' }}>
                <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-gray-100">
                  <LocationMap />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AreasWeServe;