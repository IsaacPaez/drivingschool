"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";

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

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center lg:items-start space-y-10 lg:space-y-0 lg:space-x-10">

        {/* Texto */}
        <div className="lg:w-2/3 text-center lg:text-left">
          <h2 className="text-4xl font-extrabold text-black mb-6">Areas We Serve</h2>
          <p className="text-lg text-gray-700 mb-8">
            We are dedicated to providing world-class driving school services to West Palm Beach and surrounding areas.
          </p>

          {/* Grid de áreas dinámico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {areas.length > 0 ? (
              areas.map((area) => (
                <p
                  key={area._id}
                  className="text-lg text-blue-600 hover:underline cursor-pointer"
                  onClick={() => setSelectedZone(area)}
                >
                  {area.zone}
                </p>
              ))
            ) : (
              <p className="text-gray-500">Loading areas...</p>
            )}
          </div>
        </div>

        {/* Imagen */}
        <div className="lg:w-1/3 flex justify-center">
          <Image 
            src="/Flo.jpg" 
            alt="Florida Map" 
            width={500} 
            height={500} 
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* MODAL */}
      {selectedZone && (
        <Modal isOpen={selectedZone !== null} onClose={() => setSelectedZone(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl sm:max-w-6xl h-[90vh] overflow-y-auto relative">
            

            {selectedZone?.locationImage && (
              <div className="w-full h-80 relative">
                <Image
                  src={selectedZone.locationImage}
                  alt={selectedZone.title}
                  fill
                  className="object-cover rounded-t-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}

            <div className="p-6">
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
                      <a href="tel:5613307007" className="text-blue-600 hover:underline">561 330 7007</a>
                    </p>

                    <p className="flex items-center gap-2 text-gray-800 text-sm">
                      <span className="text-purple-600 text-lg">✉️</span>
                      <strong>Email:</strong>
                      <a href="mailto:info@drivingschoolpalmbeach.com" className="text-blue-600 hover:underline">
                        info@drivingschoolpalmbeach.com
                      </a>
                    </p>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      🕒 Opening Hours
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-2 text-gray-800 text-sm">
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

              <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden border border-gray-300 shadow-md mt-6">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(selectedZone?.zone || "")}&output=embed`}
                  width="100%"
                  height="100%"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>

              <div className="mt-6">
                <h3 className="text-2xl font-semibold text-gray-900 text-center mb-4">Instructors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {selectedZone?.instructors?.map((instructor: Instructor) => (
                    <div key={instructor._id} className="text-center p-4 border rounded-lg shadow-sm bg-white flex flex-col items-center">
                      <div className="w-24 h-24 relative">
                        <Image
                          src={instructor.image || '/default-avatar.png'}
                          alt={instructor.name}
                          width={96}
                          height={96}
                          className="rounded-full border border-gray-300 shadow-sm object-cover"
                        />
                      </div>
                      <p className="text-gray-900 mt-2 font-semibold text-center min-h-[3rem] flex items-center justify-center">
                        {instructor.name}
                      </p>
                      <button className="mt-auto w-full max-w-[160px] h-[50px] bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition flex flex-col justify-center items-center">
                        <span>Book</span>
                        <span>{instructor.name.split(" ")[0]}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default AreasWeServe;