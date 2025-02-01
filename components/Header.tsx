"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import ActionButton from "./ActionButton";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Top Row with Phone and Login */}
      <div className="bg-transparent flex justify-center gap-4 items-center px-6 py-2 text-sm font-sans">
        <span className="text-white">
          Phone: <strong className="font-semibold">561 330 7007</strong>
        </span>
        <Link
          href="/login"
          className="text-blue-500 font-semibold hover:underline"
        >
          Login
        </Link>
      </div>

      {/* Bottom Row with Logo and Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between rounded-full bg-white/30 backdrop-blur-lg shadow-md mt-3">
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

        {/* Navigation */}
        <nav className="hidden md:flex space-x-6">
          {[
            { name: "Home", href: "/" },
            { name: "Lessons", href: "/Lessons" },
            { name: "Classes", href: "/Classes" },
            { name: "Online Courses", href: "/OnlineCourses" },
            { name: "Packages", href: "/Packages" },
            { name: "FAQ", href: "/FAQ" },
            { name: "Location", href: "/Location" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-800 font-medium hover:text-green-600 transition"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Book Now Button (con ID especial pero sin cambiar el texto) */}
        <div className="">
          <ActionButton type="book" id="Book Now Header" />
        </div>
      </div>
    </header>
  );
};

export default Header;
