"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Poppins } from "next/font/google";
import { scrollToSection } from "./scrollToSection";
import DrivingTestSection from "./DrivingTestSection";

// Fuente elegante y moderna
const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

// Definir animación de rebote para los botones
const bounceAnimation = {
  y: [0, -10, 0], // Movimiento de rebote
  transition: {
    duration: 0.6,
    repeat: Infinity,
    repeatType: "loop",
    ease: "easeInOut",
  },
};

const LessonsPage = () => {
  return (
    <section className={`${poppins.variable} bg-[#f5f5f5] py-24 px-8 relative`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch relative z-10">
        
        {/* 📝 Texto con animaciones suaves */}
        <div className="flex flex-col justify-between animate-fadeIn">
          <div className="space-y-6">
            <h2 className="text-6xl font-extrabold text-[#222] leading-tight">
              <span className="text-[#27ae60]">MASTER</span> YOUR <br />
              DRIVING <span className="text-[#0056b3]">SKILLS</span>
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              With over 25 years of experience, we go beyond preparing students for the DMV test.
              Our training covers real-world traffic scenarios, defensive driving, and high-speed highways like I-95.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our step-by-step approach ensures confidence, safety, and responsible driving skills for all students.
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

          {/* 🎯 Botones animados alineados abajo con rebote corregido */}
          <div className="mt-auto flex space-x-4 items-end">
            <motion.button
              animate={{ y: [1.5, -1.5, 1.5] }}
              transition={bounceAnimation}
              className="bg-[#27ae60] text-white font-semibold py-3 px-8 text-lg rounded-full shadow-lg 
                transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
              onClick={() => scrollToSection("driving-test-section")}
            >
              Book Driving Test
            </motion.button>

            <motion.button
              animate={{ y: [1.5, -1.5, 1.5] }}
              transition={bounceAnimation}
              className="border-2 border-gray-700 text-gray-800 font-semibold py-3 px-8 text-lg rounded-full 
                shadow-lg transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
            >
              Corporate Programs
            </motion.button>
          </div>
        </div>

        {/* 🖼 Imagen con animación sutil y nueva disposición */}
        <div className="relative flex justify-center items-end">
          <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 
            group hover:brightness-105">
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
    </section>
  );
};

export default LessonsPage;
