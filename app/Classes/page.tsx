"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { motion } from "framer-motion";
import ClassList from "./ClassList";

// Fuente elegante y moderna
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

const ClassesPage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState(0); // Índice de la clase activa

  return (
    <section className={`${poppins.variable} bg-white py-16 px-8`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* 📜 Contenido principal en el centro */}
        <motion.div 
          className="md:col-span-2 space-y-8"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true }}
        >
          {/* 📌 TÍTULO ESTILIZADO */}
          <h2 className="text-5xl font-extrabold text-[#222] leading-tight">
            <span className="text-red-600">4HR</span> TRAFFIC LAW <br />
            & <span className="text-[#27ae60]">SUBSTANCE ABUSE CLASS</span>
          </h2>

          {/* Botón de clase */}
          <button className="bg-[#27ae60] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#27ae60] transition">
            See all Class Dates
          </button>

          {/* Contenedor con la imagen a la derecha y la info a la izquierda */}
          <div className="flex flex-col md:flex-row gap-6 items-center">
            
            {/* Información alineada a la izquierda */}
            <div className="flex flex-col space-y-3 w-full">
              <h3 className="text-lg text-black font-semibold">Also known as</h3>
              <ul className="text-black pl-5 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-[#27ae60]">•</span> First Time Driver Class
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#27ae60]">•</span> Drug Alcohol Traffic Education (DATE)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#27ae60]">•</span> Traffic Law Substance Abuse Education Class (TLSAE)
                </li>
              </ul>

              {/* Longitud y Precio alineados en columna */}
              <div className="flex flex-col text-black font-semibold mt-3 space-y-1">
                <p><strong>Length</strong> → <span className="font-normal">4 Hours</span></p>
                <p><strong>Price</strong> → <span className="font-normal">$50.00</span></p>
              </div>
            </div>

            {/* Imagen a la derecha */}
            <Image 
              src="/AC.jpg"
              alt="Traffic Law Class"
              width={400} // Más ancha
              height={280} 
              className="rounded-xl shadow-md object-cover"
            />
          </div>

          {/* Descripción sin contenedores */}
          <h3 className="text-xl text-black font-semibold mt-6">Overview</h3>
          <p className="text-black">
            Since 1990, all first-time drivers in Florida must complete the TLSAE - Traffic Law Substance Abuse Education Course 
            or the Drug Alcohol Traffic Education (DATE) course before applying for a driver’s license or learner’s permit. <br/><br/>
            Take this course in a fun and engaging environment! You’ll learn how alcohol and drugs affect driving, traffic laws, 
            safe driving techniques, and how to stay aware on Florida roads. Upon completion, your results will be electronically 
            reported to the Florida DMV, and you’ll receive a certificate as proof.
          </p>

          {/* Llamado a la acción */}
          <p className="text-xl font-bold text-[#0056b3] mt-6">
            Call 561 330 7007 to Book Now
          </p>
        </motion.div>

        {/* 📌 Nueva lista de clases con tarjetas interactivas */}
        <motion.div
          className="bg-white text-black p-4 rounded-xl shadow-md w-[350px] max-h-fit"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-semibold mb-4 text-center">Class List</h3>
          <ClassList selectedClass={selectedClass} setSelectedClass={setSelectedClass} />
        </motion.div>

      </div>
    </section>
  );
};

export default ClassesPage;
