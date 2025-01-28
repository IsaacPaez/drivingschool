"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-[#f8f9fa] py-1">
      <div className="max-w-6xl mx-auto px-5">
        {/* Contenedor Principal */}
        <div className="flex flex-wrap justify-between items-center md:space-y-0">
          {/* Sección Izquierda */}
          <div className="text-center flex flex-col items-center mt-4">
            <Image
              src="/DV-removebg-preview.png"
              alt="Logo"
              width={100}
              height={100}
              className="mx-auto"
            />
            <h2 className="text-xl font-bold mt-2 text-black leading-tight text-center">
              Affordable Driving <br /> Traffic School
            </h2>
            <Link
              href="/book-now"
              className="bg-blue-600 text-white font-bold px-6 py-2 mt-4 rounded-full inline-block hover:bg-[#4CAF50]"
            >
              Book Now
            </Link>
          </div>

          {/* Sección Central */}
          <div className="text-center md:text-left mt-6 md:mt-0">
            <h3 className="text-lg font-bold mb-4 text-black">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/lessons"
                  className="text-black hover:underline hover:text-blue-600"
                >
                  Lessons
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="text-black hover:underline hover:text-blue-600"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-black hover:underline hover:text-blue-600"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-black hover:underline hover:text-blue-600"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Sección Derecha */}
          <div className="text-center md:text-left mt-6 md:mt-0">
            <h3 className="text-lg font-bold mb-4 text-black">Contact Us</h3>
            <ul className="space-y-2 text-black">
              <li>West Palm Beach, FL</li>
              <li>
                <a
                  href="mailto:info@drivingschoolpalmbeach.com"
                  className="text-black hover:underline hover:text-blue-600"
                >
                  info@drivingschoolpalmbeach.com
                </a>
              </li>
              <li>561 330 7007</li>
              <li>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:underline hover:text-blue-600"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea Inferior */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Powered by BookingTimes.com
        </div>
      </div>
    </footer>
  );
};

export default Footer;
