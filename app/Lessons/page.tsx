"use client";

import React from "react";
import Image from "next/image";
import { Poppins } from "next/font/google";
import DrivingTestSection from "./DrivingTestSection";
import CorporatePrograms from "./CorporatePrograms";
import Link from "next/link";
import DrivingLessons from "@/components/DrivingLessons";

// Fuente elegante y moderna
const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});



const LessonsPage = () => {
  return (
    <section className={`${poppins.variable} bg-[#f5f5f5] py-24 px-8 relative`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
        {/* 📝 Texto con animaciones suaves */}
        <div className="flex flex-col justify-between animate-fadeIn mt-20">
          <div className="space-y-6">
            <div className="hidden md:block text-left">
              <Link href="/Book-Now" passHref>
                <div className="bg-[#0056b3] text-white font-semibold px-6 py-2 w-fit self-start rounded-full shadow-lg shadow-gray-700 hover:shadow-black hover:bg-[#27ae60] hover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1">
                  Book Driving Lessons
                </div>
              </Link>
            </div>

            <h2 className="text-6xl font-extrabold text-[#222] leading-tight">
              <span className="text-[#27ae60]">LEARN</span> ROAD <br />
              SKILLS <span className="text-[#0056b3]">FOR LIFE</span>
            </h2>
            <p className="text-lg text-black leading-relaxed">
              With over 25 years of experience, we go beyond preparing students
              for the DMV test. Our training covers real-world traffic
              scenarios, defensive driving, and high-speed highways like I-95.
            </p>
            <p className="text-lg text-black leading-relaxed">
              Our step-by-step approach ensures confidence, safety, and
              responsible driving skills for all students.
            </p>

            {/* 📌 Links atractivos con solo los enlaces en verde */}
            <ul className="space-y-3 text-lg font-semibold text-black">
              <li>
                Nervous Driver or Parent?{" "}
                <a href="#" className="text-[#27ae60] hover:underline">
                  Read More
                </a>
              </li>
              <li>
                Want to know more?{" "}
                <a href="#" className="text-[#27ae60] hover:underline">
                  Read our FAQ
                </a>
              </li>
            </ul>
          </div>
          {/* Sección de Learn Road Skills desde MongoDB */}
          <DrivingLessons category="Road Skills for Life" />

          
        </div>

        {/* 🖼 Imagen con animación sutil y nueva disposición */}
        <div className="relative flex justify-center items-start mt-20">
          <div
            className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 
            group hover:brightness-105"
          >
            <Image
              src="/TPB.jpg"
              alt="Traffic in Palm Beach"
              width={400}
              height={320}
              className="rounded-2xl object-cover transition-all duration-500 group-hover:scale-110"
            />
          </div>
        </div>
      </div>

      {/* Sección de Driving Test */}
      <DrivingTestSection />

      {/* Sección de Corporate Programs */}
      <CorporatePrograms />
    </section>
  );
};

export default LessonsPage;
