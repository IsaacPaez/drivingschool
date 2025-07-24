"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import LoadingSpinner from './common/LoadingSpinner';
import { useRouter } from 'next/navigation';
import LocationMap from "../app/Location/LocationMapHome";
import LocationModal from "../app/Location/LocationModal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Definir interfaces
interface Instructor {
  _id: string;
  name: string;
  image?: string;
}

interface Area {
  _id: string;
  title: string;
  zone: string;
  locationImage?: string;
  description?: string;
  instructors?: Instructor[];
}

const AreasWeServe = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedZone, setSelectedZone] = useState<Area | null>(null);
  const router = useRouter();

  const handleBookNow = () => {
    setSelectedZone(null);
    try {
      router.push('/Book-Now');
    } catch {
      window.location.href = '/Book-Now';
    }
  };

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

  // Fondo blanco puro y layout premium
  return (
    <section className="bg-white py-20 w-full min-h-[70vh]">
      <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center lg:items-start gap-16 px-4 lg:px-0" style={{maxWidth: '1500px'}}>
        {/* Tarjeta premium Boca Raton */}
        <div className="lg:w-2/3 w-full flex flex-col items-center lg:items-start">
          <h2 className="text-4xl font-black text-gray-900 mb-4 text-center lg:text-left tracking-tight">Areas We Serve</h2>
          <p className="text-lg text-gray-700 mb-10 w-full text-center lg:text-left max-w-2xl">We are dedicated to providing world-class driving school services to West Palm Beach and surrounding areas.</p>

          {/* Solo una zona: Boca Raton premium card */}
          {areas.length === 1 && (
            <div className="w-full flex flex-col items-center lg:items-start">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 w-full max-w-2xl mb-8 flex flex-col items-start gap-4 transition-all duration-300 lg:ml-0 lg:mr-auto">
                {/* SVG pin premium */}
                <div className="mb-2">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="15" fill="#F5F6FA" stroke="#1A7F5A" strokeWidth="2"/>
                    <path d="M16 8C12.6863 8 10 10.6863 10 14C10 18.25 16 24 16 24C16 24 22 18.25 22 14C22 10.6863 19.3137 8 16 8Z" fill="#1A7F5A"/>
                    <circle cx="16" cy="14" r="3" fill="white"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-extrabold text-[#1A7F5A] mb-2 tracking-tight">Boca Raton, FL</h3>
                <p className="text-gray-700 text-base leading-relaxed mb-4">{areas[0].description}</p>
                <button
                  className="flex items-center gap-2 border-2 border-[#27ae60] text-[#27ae60] font-bold py-3 px-8 rounded-full bg-white shadow hover:bg-green-50 transition text-lg mt-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                  onClick={() => setSelectedZone(areas[0])}
                >
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2} style={{minWidth: '1.5rem'}}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z' />
                  </svg>
                  More Details
                </button>
              </div>
            </div>
          )}

          {/* Si hay varias zonas, mostrar como carrusel premium */}
          {areas.length > 1 && (
            <div className="w-full relative">
              <div className="relative w-full flex items-center" style={{minHeight: '320px'}}>
                <Swiper
                  modules={[Pagination, Autoplay, Navigation]}
                  spaceBetween={20}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                  pagination={{ clickable: true, el: '.swiper-pagination-areas' }}
                  autoplay={{ delay: 4000, disableOnInteraction: false }}
                  navigation={{
                    nextEl: ".swiper-button-next-areas",
                    prevEl: ".swiper-button-prev-areas",
                  }}
                  loop
                  className="w-full"
                >
                  {areas.map((area) => (
                    <SwiperSlide key={area._id}>
                      <div
                        className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center hover:shadow-xl transition cursor-pointer group h-80"
                        onClick={() => setSelectedZone(area)}
                      >
                        <div className="w-12 h-12 mb-3 flex items-center justify-center bg-[#F5F6FA] rounded-full group-hover:bg-green-100 transition">
                          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="15" fill="#F5F6FA" stroke="#1A7F5A" strokeWidth="2"/>
                            <path d="M16 8C12.6863 8 10 10.6863 10 14C10 18.25 16 24 16 24C16 24 22 18.25 22 14C22 10.6863 19.3137 8 16 8Z" fill="#1A7F5A"/>
                            <circle cx="16" cy="14" r="3" fill="white"/>
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#1A7F5A] mb-3 text-center">{area.zone}</h3>
                        <p className="text-gray-600 text-sm text-center mb-4 flex-grow">{area.description?.slice(0, 120) || 'Driving lessons available here.'}</p>
                        <button
                          className="mt-auto flex items-center gap-2 border-2 border-[#27ae60] text-[#27ae60] font-bold py-3 px-6 rounded-full bg-white shadow hover:bg-green-50 transition focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                        >
                          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2} style={{minWidth: '1.25rem'}}>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z' />
                          </svg>
                          View Details
                        </button>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Flechas de navegación para el carrusel de áreas */}
                <div className="swiper-button-prev-areas z-20 absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-md w-10 h-10 flex items-center justify-center rounded-full cursor-pointer hover:bg-[#27ae60] transition border border-[#1A7F5A]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                    <path d="M15.5 19L9.5 12L15.5 5" stroke="#1A7F5A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="swiper-button-next-areas z-20 absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-md w-10 h-10 flex items-center justify-center rounded-full cursor-pointer hover:bg-[#27ae60] transition border border-[#1A7F5A]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                    <path d="M8.5 5L14.5 12L8.5 19" stroke="#1A7F5A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              
              {/* Paginación personalizada para el carrusel de áreas */}
              <div className="swiper-pagination-areas flex justify-center mt-6 mb-2 w-full"></div>
            </div>
          )}

          {/* Loading */}
          {areas.length === 0 && (
            <div className="flex justify-center w-full mt-8">
              <LoadingSpinner label="Loading areas..." />
            </div>
          )}
        </div>

        {/* Mapa premium alineado */}
        <div className="lg:w-1/2 w-full flex justify-center mb-8 lg:mb-0">
          <div className="w-full max-w-[1200px] min-w-[600px] rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white" style={{height: '700px', display: 'flex', alignItems: 'stretch'}}>
            <div style={{width: '100%', height: '100%'}}>
              <LocationMap />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedZone && (
        <LocationModal isOpen={selectedZone !== null} onClose={() => setSelectedZone(null)}>
          <div className="p-8 max-h-[80vh] overflow-y-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mt-4 mb-6 tracking-tight">
              {selectedZone?.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <p className="text-lg text-gray-700 whitespace-pre-line leading-relaxed">{selectedZone?.description}</p>
              <div className="p-6 bg-gray-50 rounded-2xl shadow-md border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">Location Info</h3>
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-gray-800 text-base">
                    <span className="inline-block w-5 h-5"><svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" stroke="#1A7F5A" strokeWidth="2"/><path d="M10 4C7.23858 4 5 6.23858 5 9C5 12.75 10 17 10 17C10 17 15 12.75 15 9C15 6.23858 12.7614 4 10 4Z" fill="#1A7F5A"/><circle cx="10" cy="9" r="2" fill="white"/></svg></span>
                    <strong>Phone:</strong>
                    <a href="tel:5613307007" className="text-blue-700 hover:underline font-medium">561 330 7007</a>
                  </p>
                  <p className="flex items-center gap-2 text-gray-800 text-base">
                    <span className="inline-block w-5 h-5"><svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="2" y="4" width="16" height="12" rx="2" fill="#1A7F5A"/><rect x="2" y="4" width="16" height="12" rx="2" stroke="#1A7F5A" strokeWidth="2"/><path d="M2 4L10 12L18 4" stroke="white" strokeWidth="2"/></svg></span>
                    <strong>Email:</strong>
                    <a href="mailto:info@drivingschoolpalmbeach.com" className="text-blue-700 hover:underline font-medium">info@drivingschoolpalmbeach.com</a>
                  </p>
                </div>
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">Opening Hours</h3>
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-2 text-gray-800 text-base">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <div key={day} className="flex justify-between border-b pb-1">
                        <span className="font-semibold">{day}:</span>
                        <span className="text-right">8:00am - 8:00pm</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Mapa integrado dentro del modal */}
            <div className="w-full flex justify-center mt-8 mb-8">
              <div className="w-full max-w-2xl h-64 md:h-80 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(selectedZone?.zone || "")}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-gray-900 text-center mb-4">Instructors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {selectedZone?.instructors?.map((instructor: Instructor) => (
                  <div key={instructor._id} className="text-center p-4 border rounded-xl shadow-sm bg-white flex flex-col items-center">
                    <div className="w-20 h-20 relative">
                      <Image
                        src={instructor.image || '/default-avatar.png'}
                        alt={instructor.name}
                        width={80}
                        height={80}
                        className="rounded-full border border-gray-200 shadow-sm object-cover"
                      />
                    </div>
                    <p className="text-gray-900 mt-2 font-semibold text-center min-h-[2.5rem] flex items-center justify-center">
                      {instructor.name}
                    </p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBookNow();
                      }}
                      className="mt-auto w-full max-w-[140px] h-[44px] bg-gradient-to-r from-[#1A7F5A] to-[#3ECF8E] text-white font-semibold py-2 px-4 rounded-lg hover:from-[#14804a] hover:to-[#2ebd7f] transition flex flex-col justify-center items-center cursor-pointer"
                    >
                      <span>Book</span>
                      <span>{instructor.name.split(" ")[0]}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </LocationModal>
      )}
    </section>
  );
};

export default AreasWeServe;