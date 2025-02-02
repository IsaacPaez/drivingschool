"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import locations from "@/lib/locations"; // Asegúrate de que la ruta es correcta


const LakeParkPage = ({ locationName = "Lake Park" }: { locationName?: string }) => {
  const location = locations[locationName] || locations["Lake Park"];

  return (
    <section className="bg-white w-full min-h-screen py-16 px-6">
      {/* Contenedor principal de información */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 mt-24">
        {/* Contenedor principal estilo tarjeta */}
        <div className="lg:col-span-2 bg-white shadow-xl rounded-lg p-6">
          {/* Título principal con más separación */}
          <h2 className="text-4xl font-extrabold text-[#222] leading-tight text-left">
            <span className="text-red-600">AFFORDABLE DRIVING</span> TRAFFIC
            SCHOOL AT <span className="text-[#27ae60]">{location.name.toUpperCase()}</span>
          </h2>

          {/* Imagen del curso con más espacio abajo */}
          <div className="mt-8">
            <Image
              src="/LP.jpg"
              alt={`Driving School in ${location.name}`}
              width={800}
              height={400}
              className="rounded-lg shadow-md"
            />
          </div>

          {/* Texto resumido */}
          <div className="mt-6 space-y-4">
            <p className="text-black">
              <strong>Since 1995,</strong> Affordable Driving Traffic School has helped thousands of students improve their driving skills in {location.name}.
            </p>
            <p className="text-black">
              <strong>Certified Florida Instructors</strong> teach in real traffic conditions, covering areas like West Palm Beach, Magnolia Park, and Riviera Beach.
            </p>
            <p className="text-black">
              <strong>Approved by the Florida DMV,</strong> our Traffic School offers courses taught by safety and traffic law experts.
            </p>
            <p className="text-black">
              <strong>Available Courses:</strong> 4h BDI Traffic Ticket Course, First Time Driver’s Drug & Alcohol Course, 12h ADI Class, 8h Intermediate Improvement, Court Ordered Course, Youthful Offender Course, Senior’s Discount Course, and more.
            </p>
          </div>

          {/* Botón de más información */}
          <button className="bg-[#27ae60] text-white font-bold py-3 px-4 rounded-full mt-4 shadow-lg hover:bg-[#0056b3] transition duration-300">
            See Traffic Courses
          </button>
        </div>

        {/* Contenedor lateral con contacto y mapa */}
        <div className="space-y-6">
          {/* Contenedor de contacto */}
          <div className="bg-white shadow-md p-6 rounded-lg border border-gray-300">
            <button className="w-full bg-[#0056b3] text-white font-bold py-3 px-4 rounded-lg mt-4 hover:bg-[#27ae60] shadow-lg shadow-gray-700 hover:shadow-blackhover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
              Book Now in {location.name}
            </button>
            <p className="text-center text-black mt-4">
              <strong>Phone:</strong> 561 330 7007
            </p>
            <p className="text-center text-black">
              <strong>Email: </strong>
              <a href="mailto:info@drivingschoolpalmbeach.com" className="underline text-blue-600 hover:text-[#27ae60]">
                info@drivingschoolpalmbeach.com
              </a>
            </p>

            {/* Horarios */}
            <div className="mt-4">
              <h3 className="font-semibold text-black text-center">Opening Hours:</h3>
              <ul className="text-sm text-center text-black space-y-1">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <li key={day} className="flex justify-between px-4">
                    <span>{day}</span> <span>8:00am to 8:00pm</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link href="#" className="block mt-4 text-center text-xs underline text-blue-600 hover:text-[#27ae60] transition">
              View all Locations
            </Link>
          </div>

          {/* Contenedor del mapa */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3526.6359461611686!2d${location.lng}!3d${location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1`}
              width="100%"
              height="365"
              className="rounded-lg"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LakeParkPage;
