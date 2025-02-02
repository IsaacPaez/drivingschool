"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import locations from "@/lib/locations"; // Asegúrate de que la ruta es correcta

const HaverhillPage = ({ locationName = "Haverhill" }: { locationName?: string }) => {
  const location = locations[locationName] || locations["Haverhill"];

  return (
    <section className="bg-white w-full min-h-screen py-16 px-6">
      {/* Contenedor principal de información */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 mt-24">
        {/* Contenedor principal estilo tarjeta */}
        <div className="lg:col-span-2 bg-white shadow-xl rounded-lg p-6">
          {/* Título principal con más separación */}
          <h2 className="text-4xl font-extrabold text-[#222] leading-tight text-left">
            <span className="text-[#0056B3]">AFFORDABLE DRIVING</span> TRAFFIC SCHOOL AT{" "}
            <span className="text-[#27ae60]">{location.name.toUpperCase()}</span>
          </h2>

          {/* Imagen del curso con más espacio abajo */}
          <div className="mt-8">
            <Image
              src="/HHF.jpg"
              alt={`Driving School in ${location.name}`}
              width={800}
              height={400}
              className="rounded-lg shadow-md"
            />
          </div>

          {/* Descripción y cursos */}
          <div className="mt-6 text-black">
            <p className="text-ms">
              Affordable Driving Traffic School provides DMV-certified Traffic Courses in Haverhill, 
              taught by experienced instructors in traffic law and safety.
            </p>
            <p className="text-ms mt-2">
              Select the course you need from our available options:
            </p>

            {/* Lista de cursos con links */}
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/courses/bdi-4hours" className="text-blue-600 hover:underline">
                  4 Hours BDI Traffic Ticket Course
                </Link>
              </li>
              <li>
                <Link href="/courses/first-time-drug-alcohol" className="text-blue-600 hover:underline">
                  First Time Driver is Drug and Alcohol Course
                </Link>
              </li>
              <li>
                <Link href="/courses/adi-12hours" className="text-blue-600 hover:underline">
                  12 Hours ADI Class
                </Link>
              </li>
              <li>
                <Link href="/courses/idi-8hours" className="text-blue-600 hover:underline">
                  8 Hours Intermediate Driving Improvement Course
                </Link>
              </li>
              <li>
                <Link href="/courses/youthful-offender" className="text-blue-600 hover:underline">
                  Youthful Offender Course
                </Link>
              </li>
              <li>
                <Link href="/courses/aggressive-driving" className="text-blue-600 hover:underline">
                  Aggressive Driving Improvement Course
                </Link>
              </li>
              <li>
                <Link href="/courses/senior-insurance-discount" className="text-blue-600 hover:underline">
                  Senior Insurance Discount Course
                </Link>
              </li>
              <li>
                <Link href="/courses/3-crashes-3-years" className="text-blue-600 hover:underline">
                  3 Crashes in 3 Years Course
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contenedor lateral con contacto y mapa */}
        <div className="space-y-6">
          {/* Contenedor de contacto */}
          <div className="bg-white shadow-md p-6 rounded-lg border border-gray-300">
            <button className="w-full bg-[#0056b3] text-white font-bold py-3 px-4 rounded-lg mt-4 hover:bg-[#27ae60] transition">
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

export default HaverhillPage;
