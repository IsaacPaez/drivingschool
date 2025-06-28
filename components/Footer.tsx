"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram, } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-[#2563eb] via-[#0056b3] to-[#0a2540] text-white py-12">
      {/* 🔹 Fondo con efecto Glassmorphism (Margen inferior añadido) */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-3xl mx-6 mt-6 mb-6 shadow-lg border border-white/20"></div>

      <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 items-center z-10">
        {/* 🔹 Sección Izquierda - Logo y Booking */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center mb-4" style={{height: '130px'}}>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[130px] h-[130px] rounded-full bg-white/80 shadow-lg z-0" style={{filter: 'blur(2px)'}}></div>
            <Image
              src="/DV-removebg-preview.png"
              alt="Logo"
              width={120}
              height={120}
              className="relative z-10 drop-shadow-xl"
            />
          </div>
          <h2 className="text-2xl font-extrabold tracking-widest text-white">
            Affordable Driving <br /> Traffic School
          </h2>
          <Link
            href="/book-now"
            className="mt-6 bg-gradient-to-r from-[#0056b3] to-[#27ae60] text-white font-bold px-6 py-3 rounded-full transition-all duration-500 transform hover:scale-105 hover:shadow-lg hover:shadow-[#27ae60]"
          >
            Book Now
          </Link>
        </div>

        {/* 🔹 Sección Central - Navegación con efecto Glow */}
        <div className="text-center">
          <h3 className="text-2xl font-extrabold mb-6 mt-2 uppercase tracking-widest text-[#27ae60] border-b border-[#27ae60]/60 inline-block pb-1" style={{textShadow: '0 0 12px #27ae60aa, 0 2px 8px #0006'}}>
            Navigation
          </h3>
          <ul className="space-y-3 text-lg">
            <li>
              <Link href="/Lessons" className="hover:text-[#27ae60] transition-all duration-300 hover:drop-shadow-lg">
                Lessons
              </Link>
            </li>
            <li>
              <Link href="/Classes" className="hover:text-[#27ae60] transition-all duration-300 hover:drop-shadow-lg">
                Courses
              </Link>
            </li>
            <li>
              <Link href="/TermsOfServices" className="hover:text-[#27ae60] transition-all duration-300 hover:drop-shadow-lg">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/PrivacyPolicy" className="hover:text-[#27ae60] transition-all duration-300 hover:drop-shadow-lg">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* 🔹 Sección Derecha - Contacto y Redes Sociales con Neon Effect */}
        <div className="text-center">
          <h3 className="text-2xl font-extrabold mb-6 mt-2 uppercase tracking-widest text-[#27ae60] border-b border-[#27ae60]/60 inline-block pb-1" style={{textShadow: '0 0 12px #27ae60aa, 0 2px 8px #0006'}}>
            Contact Us
          </h3>
          <ul className="space-y-3 text-lg">
            <li>
              <a href="/Location" className="hover:text-[#27ae60] transition-all duration-300">
              West Palm Beach, FL
              </a>
              </li>
            <li>
              <a href="/contact" className="hover:text-[#27ae60] transition-all duration-300">
                info@drivingschoolpalmbeach.com
              </a>
            </li>
            <li>📞 561 330 7007</li>
          </ul>

          {/* 🔹 Redes Sociales con efecto Glow */}
          <div className="flex justify-center space-x-5 mt-5">
            <a href="https://www.facebook.com/AffordableDrivingTrafficSchool/" target="_blank" rel="noopener noreferrer" className="text-white text-2xl hover:text-[#3b5998] transition duration-300 hover:scale-125 hover:drop-shadow-lg">
              <FaFacebook />
            </a>
            <a href="https://www.instagram.com/adtrafficschool/" target="_blank" rel="noopener noreferrer" className="text-white text-2xl hover:text-[#E1306C] transition duration-300 hover:scale-125 hover:drop-shadow-lg">
              <FaInstagram />
            </a>
           
          </div>
        </div>
      </div>

      {/* 🔹 Derechos de Autor (Centrado completamente en el contenedor) */}
      <div className="relative text-center text-gray-400 text-sm mt-10 pb-4">
        &copy; {new Date().getFullYear()} Powered By Botopia Technology S.A.S
      </div>
    </footer>
  );
};

export default Footer;
