"use client";

import React from "react";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { motion } from "framer-motion";
import Link from "next/link";

// Fuente moderna y elegante
const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

// Animación de entrada
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const CorporatePrograms = () => {
  return (
    <section
      id="corporate-programs-section"
      className={`${poppins.variable} bg-gray-100 py-5 px-10`}
    >
      {/* 📌 TÍTULO CENTRALIZADO (Subido más cerca de la sección anterior) */}
      <motion.h2
        className="text-5xl font-extrabold text-center mb-16 leading-tight"
        initial="hidden"
        whileInView="visible"
        variants={fadeIn}
        viewport={{ once: true }}
      >
        <span className="text-[#27ae60]">Corporate</span>{" "}
        <span className="text-[#0056b3]">Programs</span>
      </motion.h2>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* 📜 CONTENIDO A LA IZQUIERDA */}
        <motion.div
          className="space-y-4 text-left"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-black">
            Upskill Your Organization
          </h3>

          <p className="text-base text-black leading-relaxed">
            Affordable Driving Traffic School offers courses that benefit
            industries of all sizes, training employees who need to drive as
            part of their occupation.
          </p>

          <p className="text-base text-black leading-relaxed">
            Our instructors bring extensive experience from various industries,
            including Law Enforcement, Emergency Transportation, and the
            Transportation sector. Our focus is on reducing risks on the road by
            increasing driver awareness and enhancing knowledge of advanced
            driving techniques.
          </p>

          {/* 🔹 Contenedor para el texto y el botón con más separación */}
          <div className="flex flex-col space-y-6">
            {/* 🔹 Contacto con enlace azul SOLO en "Contact us" */}
            <p className="text-base font-semibold text-black">
              <Link href="/contact" className="text-[#0056b3] hover:underline">
                Contact us
              </Link>{" "}
              for more information
            </p>

            {/* Botón de "Inquire Now" */}
            <Link
              href="/contact"
              className="bg-[#0056b3] text-white font-semibold px-6 py-2 w-fit rounded-full shadow-lg shadow-gray-700 hover:shadow-black hover:bg-[#27ae60] hover:-translate-y-1 transition transform duration-300 ease-out cursor-pointer active:translate-y-1"
            >
              Inquire Now
            </Link>
          </div>
        </motion.div>

        {/* 📌 IMAGEN A LA DERECHA */}
        <motion.div
          className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 group hover:brightness-105"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true }}
        >
          <Image
            src="/CP.jpg" // Asegúrate de que la imagen esté en /public
            alt="Corporate Training"
            width={750}
            height={520}
            className="rounded-2xl object-cover transition-all duration-500 group-hover:scale-105"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default CorporatePrograms;
