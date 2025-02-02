"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import locations from "@/lib/locations"; // Asegúrate de que la ruta es correcta

const BoyntonBeachPage = ({
  locationName = "Boynton Beach",
}: {
  locationName?: string;
}) => {
  const location = locations[locationName] || locations["Boynton Beach"];

  return (
    <section className="bg-white w-full min-h-screen py-16 px-6">
      {/* Contenedor principal */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 mt-24">
        {/* Contenedor principal estilo tarjeta */}
        <div className="lg:col-span-2 bg-white shadow-xl rounded-lg p-6">
          {/* Título principal */}
          <h2 className="text-4xl font-extrabold text-[#222] leading-tight text-left">
            <span className="text-[#0056b3]">AFFORDABLE DRIVING</span> TRAFFIC
            SCHOOL AT{" "}
            <span className="text-[#27ae60]">
              {location.name.toUpperCase()}
            </span>
          </h2>

          {/* Subtítulo */}
          <h2 className="text-ms text-[#222] leading-tight text-left mt-5">
            <span className="text-black">
              DMV-certified Traffic Courses in Boynton Beach, taught by
              experienced instructors. Choose the right course for your needs.
            </span>
          </h2>

          {/* Imagen */}
          <div className="mt-8">
            <Image
              src="/1ABB.jpg"
              alt={`Driving School in ${location.name}`}
              width={800}
              height={300}
              className="rounded-lg shadow-md"
            />
          </div>

          {/* Contenedor de cursos (2 columnas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {/* Curso 1 */}
            <div className="bg-white p-5 shadow-md rounded-lg border border-gray-200">
              <h3 className="text-lg text-black font-bold">
                4 Hour BDI Course
              </h3>
              <p className="text-black">
                Avoid points on your license and insurance hikes.
              </p>
              <p className="text-[#27ae60] font-semibold">Duration: 4 hours</p>
              <button className="bg-[#27ae60] text-white font-bold py-2 px-4 rounded-lg mt-3 hover:bg-[#0056b3] shadow-lg shadow-gray-700 hover:shadow-blackhover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                Register Now
              </button>
            </div>

            {/* Curso 2 */}
            <div className="bg-white p-5 shadow-md rounded-lg border border-gray-200">
              <h3 className="text-lg text-black font-bold">12 Hour ADI Course</h3>
              <p className="text-black">
                For habitual offenders & license reinstatement.
              </p>
              <p className="text-[#27ae60] font-semibold">Duration: 12 hours</p>
              <button className="bg-[#27ae60] text-white font-bold py-2 px-4 rounded-lg mt-3 hover:bg-[#0056b3] shadow-lg shadow-gray-700 hover:shadow-blackhover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                Register Now
              </button>
            </div>

            {/* Curso 3 */}
            <div className="bg-white p-5 shadow-md rounded-lg border border-gray-200">
              <h3 className="text-lg text-black font-bold">8 Hour Court Ordered IDI</h3>
              <p className="text-black">
                Court-approved Intermediate Driving Improvement.
              </p>
              <p className="text-[#27ae60] font-semibold">Duration: 8 hours</p>
              <button className="bg-[#27ae60] text-white font-bold py-2 px-4 rounded-lg mt-3 hover:bg-[#0056b3] shadow-lg shadow-gray-700 hover:shadow-blackhover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                Register Now
              </button>
            </div>

            {/* Curso 4 */}
            <div className="bg-white p-5 shadow-md rounded-lg border border-gray-200">
              <h3 className="text-lg text-black font-bold">Aggressive Driving Course</h3>
              <p className="text-black">
                For drivers required to address aggressive behavior.
              </p>
              <p className="text-[#27ae60] font-semibold">
                In-Person / Live Stream
              </p>
              <button className="bg-[#27ae60] text-white font-bold py-2 px-4 rounded-lg mt-3 hover:bg-[#0056b3] shadow-lg shadow-gray-700 hover:shadow-blackhover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                Register Now
              </button>
            </div>

            {/* Curso 5 */}
            <div className="bg-white p-5 shadow-md rounded-lg border border-gray-200">
              <h3 className="text-lg text-black font-bold">Teen Youthful Offender</h3>
              <p className="text-black">
                For drivers under 25 with violations.
              </p>
              <p className="text-[#27ae60] font-semibold">Classroom Only</p>
              <button className="bg-[#27ae60] text-white font-bold py-2 px-4 rounded-lg mt-3 hover:bg-[#0056b3] shadow-lg shadow-gray-700 hover:shadow-blackhover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                Register Now
              </button>
            </div>

            {/* Curso 6 */}
            <div className="bg-white p-5 shadow-md rounded-lg border border-gray-200">
              <h3 className="text-lg text-black font-bold">3 Crashes in 3 Years</h3>
              <p className="text-black">
                For drivers convicted of 3 traffic offenses.
              </p>
              <p className="text-[#27ae60] font-semibold">
                12h ADI + 4h Behind-the-Wheel
              </p>
              <button className="bg-[#27ae60] text-white font-bold py-2 px-4 rounded-lg mt-3 hover:bg-[#0056b3] shadow-lg shadow-gray-700 hover:shadow-blackhover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                Register Now
              </button>
            </div>

            {/* Curso 7 */}
            <div className="bg-white p-5 shadow-md rounded-lg border border-gray-200">
              <h3 className="text-lg text-black font-bold">Mature Insurance Discount</h3>
              <p className="text-black">
                Save 10%+ on insurance if you’re 55 or older.
              </p>
              <p className="text-[#27ae60] font-semibold">Valid for 3 years</p>
              <button className="bg-[#27ae60] text-white font-bold py-2 px-4 rounded-lg mt-3 hover:bg-[#0056b3] shadow-lg shadow-gray-700 hover:shadow-blackhover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                Register Now
              </button>
            </div>

            {/* Nuevo Curso 8 - Drug and Alcohol Class */}
            <div className="bg-white p-5 shadow-md rounded-lg border border-gray-200">
              <h3 className="text-lg text-black font-bold">Drug and Alcohol Class</h3>
              <p className="text-black">
                Mandatory for first-time learner’s permit holders.
              </p>
              <p className="text-[#27ae60] font-semibold">
                In-Person / Live Stream
              </p>
              <button className="bg-[#27ae60] text-white font-bold py-2 px-4 rounded-lg mt-3 hover:bg-[#0056b3] shadow-lg shadow-gray-700 hover:shadow-blackhover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                Register Now
              </button>
            </div>
          </div>
        </div>

        {/* Contenedor lateral con contacto y mapa */}
        <div className="space-y-6">
          {/* Contenedor de contacto */}
          <div className="bg-white shadow-md p-6 rounded-lg border border-gray-300">
            <button className="w-full bg-[#0056b3] hover:bg-[#27ae60] text-white font-bold py-3 px-4 rounded-lg mt-4 shadow-lg shadow-gray-700 hover:shadow-blackhover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
              Book Now in {location.name}
            </button>
            <p className="text-center text-black mt-4">
              <strong>Phone:</strong> 561 330 7007
            </p>
            <p className="text-center text-black">
              <strong>Email: </strong>
              <a
                href="mailto:info@drivingschoolpalmbeach.com"
                className="underline text-blue-600 hover:text-[#27ae60]"
              >
                info@drivingschoolpalmbeach.com
              </a>
            </p>
            {/* Horarios */}
            <div className="mt-4">
              <h3 className="font-semibold text-black text-center">
                Opening Hours:
              </h3>
              <ul className="text-sm text-center text-black space-y-1">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <li key={day} className="flex justify-between px-4">
                    <span>{day}</span> <span>8:00am to 8:00pm</span>
                  </li>
                ))}
              </ul>
              
            </div>
            <Link
              href="#"
              className="block mt-4 text-center text-xs underline text-blue-600 hover:text-[#27ae60] transition"
            >
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

export default BoyntonBeachPage;
