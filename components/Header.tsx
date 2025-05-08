"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import CartIcon from "./CartIcon";

const Header = () => {
  const pathname = usePathname();
  const [isHome, setIsHome] = useState(false);

  useEffect(() => {
    setIsHome(pathname === "/"); // Se actualiza correctamente en cada cambio de ruta
  }, [pathname]);
  // Estado para controlar si el menú móvil está abierto
  const [isOpen, setIsOpen] = useState(false);

  // Links de navegación (para desktop y mobile)
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Lessons", href: "/Lessons" },
    { name: "Classes", href: "/Classes" },
    { name: "Online Courses", href: "/OnlineCourses" },
    { name: "Packages", href: "/Packages" },
    { name: "FAQ", href: "/FAQ" },
    { name: "Location", href: "/Location" },
  ];

  // New teacher links for center navigation
  const teacherNavItems = [
    { name: "My Schedule", href: "/teachers" },
    { name: "My Students", href: "/teachers/students" },
  ];

  // Helper to check if we are in a teacher section
  const isTeacherSection = pathname.startsWith("/teachers");

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4">
      {/* Top Row with Phone and Login */}
      <div className="bg-transparent flex lg:justify-center gap-4 items-center py-2 text-sm font-sans relative">
        <span
          className={`hidden lg:flex ${isHome ? "text-white" : "text-blue-800"} font-semibold`}
        >
          Phone: <strong className="font-semibold">561 330 7007</strong>
        </span>
        {/* 🛒 Carrito de Compras con color dinámico */}
        <CartIcon
          color={` ${isHome ? "black" : "black"}`}
        />
        {/* Botones Login y Sign In FIJOS en la esquina superior derecha */}
        <div className="fixed top-4 right-8 flex gap-4 z-50">
          <button
            className="bg-[#0056b3] text-white font-semibold px-6 py-2 rounded-full shadow-lg shadow-gray-700 hover:shadow-black hover:bg-[#27ae60] hover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1"
            onClick={() => window.location.href = '/sign-in'}
          >
            Login
          </button>
          <button
            className="bg-[#f39c12] text-white font-semibold px-6 py-2 rounded-full shadow-lg shadow-gray-700 hover:shadow-black hover:bg-[#e67e22] hover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1"
            onClick={() => window.location.href = '/sign-in'}
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Bottom Row with Logo and Navigation */}
      <div className="relative max-w-7xl mx-auto px-6 py-2 flex items-center justify-between rounded-full bg-white/30 backdrop-blur-lg shadow-lg mt-3">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/DV-removebg-preview.png"
              alt="Logo"
              width={70}
              height={70}
              className="
          object-contain
          w-12 h-12      /* tamaño base en móvil */
          sm:w-16 sm:h-16 /* aumenta en pantallas ≥640px */
        "
            />
          </Link>
        </div>

        {/* Centered Teacher Navigation (Desktop only) */}
        {isTeacherSection && (
          <nav className="hidden lg:flex space-x-8 mx-auto">
            {teacherNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-semibold text-base transition ${pathname === item.href
                  ? "text-[#27ae60] font-bold"
                  : "text-blue-800 hover:text-green-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}

        {/* Menú Hamburguesa (sólo visible en móvil) */}
        <button
          className="block lg:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <div className="w-6 h-1 bg-gray-800 mb-1" />
          <div className="w-6 h-1 bg-gray-800 mb-1" />
          <div className="w-6 h-1 bg-gray-800" />
        </button>

        {/* Navegación Desktop */}
        {!isTeacherSection && (
          <nav className="hidden lg:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition ${pathname === item.href
                    ? "text-[#27ae60] font-bold"
                    : "text-gray-800 hover:text-green-600"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}

        {/* Botón Book Now (sólo en desktop) */}
        {!isTeacherSection && (
          <div className="hidden lg:block text-left">
            <Link href="/Book-Now" passHref>
              <div className="bg-[#27ae60] text-white font-semibold px-6 py-2 w-fit self-start rounded-full shadow-lg  shadow-gray-700 hover:shadow-black hover:bg-[#0056b3] hover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                Book Now
              </div>
            </Link>
          </div>
        )}

        {/* Navegación Móvil (Dropdown) */}
        {isOpen && (
          <div className="absolute top-full right-0  z-50">
            <div
              className="max-w-4xl  px-6 py-4
                  bg-white/90 backdrop-blur-lg shadow-lg  rounded-lg
                  
                  lg:hidden flex flex-col items-center space-y-4"
            >
              {/* Links de navegación en modo móvil */}
              <nav className="flex flex-col items-center space-y-3">
                {/* Teacher links first in mobile, only if in teacher section */}
                {isTeacherSection && teacherNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`font-semibold text-base transition ${pathname === item.href
                      ? "text-[#27ae60] font-bold"
                      : "text-blue-800 hover:text-green-600"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {/* Main nav items */}
                {!isTeacherSection && navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)} // Cerrar al hacer clic
                    className={`font-medium transition ${pathname === item.href
                        ? "text-[#27ae60] font-bold"
                        : "text-black hover:text-gray-200"
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Botón Book Now en móvil */}
              <div className="text-left">
                <Link href="/Book-Now" passHref>
                  <div className="bg-[#27ae60] text-white font-semibold px-6 py-2 w-fit self-start rounded-full shadow-lg hover:bg-[#0056b3] hover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                    Book Now
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
