"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const Header = () => {
  return (
    <header className="bg-white relative border-b shadow-sm">
      {/* Top Row with Phone and Login */}
      <div className="bg-[#f8f9fa] border-b-[#eaeaea] flex justify-center items-center py-2 px-1 font-sans z-10 relative">
        <span className="text-xs text-black">
          Phone: <strong className="font-bold">561 330 7007</strong>
        </span>
        <Link
          href="/login"
          className="ml-4 text-[#007bff] font-bold hover:underline text-xs"
        >
          Login
        </Link>
      </div>

      {/* Bottom Row with Logo and Navigation */}
      <div className="relative z-10">
        {/* Logo */}
        <div className="absolute left-8 top-[-10px] z-20 ml-28 mt-5">
          <Image
            src="/DV-removebg-preview.png"
            alt="Logo"
            width={115}
            height={120}
            className="relative"
          />
        </div>

        {/* Navigation */}
        <nav className="relative flex justify-end items-center mx-8 py-6 max-w-[90%] space-x-4 top-1 -ml-1">
          <ul className="flex justify-end space-x-4">
            <li>
              <Link
                href="/"
                className="text-[#4CAF50] hover:text-[#4CAF50] underline decoration-[#4CAF50]"
              >
                Home
              </Link>
            </li>
            <li>
              <Link href="/Lessons" className="text-black hover:text-[#4CAF50]">
                Lessons
              </Link>
            </li>
            <li>
              <Link href="/Classes" className="text-black hover:text-[#4CAF50]">
                Classes
              </Link>
            </li>
            <li>
              <Link
                href="/OnlineCourses"
                className="text-black hover:text-[#4CAF50]"
              >
                Online Courses
              </Link>
            </li>
            <li>
              <Link
                href="/Packages"
                className="text-black hover:text-[#4CAF50]"
              >
                Packages
              </Link>
            </li>
            <li>
              <Link href="/FAQ" className="text-black hover:text-[#4CAF50]">
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/Location"
                className="text-black hover:text-[#4CAF50]"
              >
                Location
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Book Now Button */}
      <div className="absolute top-14 right-8 z-10 hidden md:block">
        <Link
          href="/Book-Now"
          className="bg-[#4CAF50] text-white font-bold px-3 py-2 rounded-full hover:bg-[#0056b3] shadow-md"
        >
          Book Now
        </Link>
      </div>
    </header>
  );
};

export default Header;
