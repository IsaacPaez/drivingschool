"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import CartIcon from "./CartIcon";

const Header = () => {
  const router = useRouter();
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

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Top Row with Phone and Login */}
      <div className="bg-transparent flex justify-center gap-4 items-center px-6 py-2 text-sm font-sans">
        <span
          className={`${isHome ? "text-white" : "text-blue-800"} font-semibold`}
        >
          Phone: <strong className="font-semibold">561 330 7007</strong>
        </span>

        {/* Sección de Login y Sign In en la esquina superior derecha */}
        <div className="absolute top-2 right-6 flex gap-4">
          <SignedOut>
            {/* Botón de Inicio de Sesión con Clerk */}
            <SignInButton mode="modal">
              <button
                className="bg-[#0056b3] text-white font-semibold px-6 py-2 rounded-full shadow-lg shadow-gray-700 
        hover:shadow-black hover:bg-[#27ae60] hover:-translate-y-1 transition transform duration-300 ease-out 
        cursor-pointer active:translate-y-1"
              >
                Login
              </button>
            </SignInButton>

            {/* Botón de Registro con Clerk */}
            <SignUpButton mode="modal">
              <button
                className="bg-[#f39c12] text-white font-semibold px-6 py-2 rounded-full shadow-lg shadow-gray-700 
        hover:shadow-black hover:bg-[#e67e22] hover:-translate-y-1 transition transform duration-300 ease-out 
        cursor-pointer active:translate-y-1"
              >
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>

          {/* Menú del Usuario cuando está autenticado */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* 🛒 Carrito de Compras con color dinámico */}
        <CartIcon color={isHome ? "white" : "black"} />
      </div>

      {/* Bottom Row with Logo and Navigation */}
      <div className="relative max-w-7xl mx-auto px-6 py-2 flex items-center justify-between rounded-full bg-white/30 backdrop-blur-lg shadow-md mt-3">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/DV-removebg-preview.png"
              alt="Logo"
              width={70}
              height={70}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Menú Hamburguesa (sólo visible en móvil) */}
        <button
          className="block md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <div className="w-6 h-1 bg-gray-800 mb-1" />
          <div className="w-6 h-1 bg-gray-800 mb-1" />
          <div className="w-6 h-1 bg-gray-800" />
        </button>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-medium transition ${
                pathname === item.href
                  ? "text-[#27ae60] font-bold"
                  : "text-gray-800 hover:text-green-600"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Botón Book Now (sólo en desktop) */}
        <div className="hidden md:block text-left">
          <Link href="/Book-Now" passHref>
            <div className="bg-[#27ae60] text-white font-semibold px-6 py-2 w-fit self-start rounded-full shadow-lg hover:bg-[#0056b3] hover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
              Book Now
            </div>
          </Link>
        </div>

        {/* Navegación Móvil (Dropdown) */}
        {isOpen && (
          <div className="absolute top-full right-0  z-50">
            <div
              className="max-w-4xl  px-6 py-4
                  bg-white/90 backdrop-blur-lg shadow-md  rounded-lg
                  
                  md:hidden flex flex-col items-center space-y-4"
            >
              {/* Links de navegación en modo móvil */}
              <nav className="flex flex-col items-center space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)} // Cerrar al hacer clic
                    className={`font-medium transition ${
                      pathname === item.href
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
