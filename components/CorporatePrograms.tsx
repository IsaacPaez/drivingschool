"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePageContent } from "@/hooks/usePageContent";
import Link from "next/link";

const CorporatePrograms = () => {
  // Obtener contenido dinámico del dashboard
  const { content, loading } = usePageContent({ pageType: "home" });

  // Valores por defecto (fallback)
  const defaultCorporateProgramsSection = {
    title: "Corporate Programs",
    subtitle: "Upskill Your Organization",
    description:
      "Affordable Driving Traffic School offers courses that benefit industries of all sizes, training employees who need to drive as part of their occupation.\n\nOur instructors bring extensive experience from various industries, including Law Enforcement, Emergency Transportation, and the Transportation sector. Our focus is on reducing risks on the road by increasing driver awareness and enhancing knowledge of advanced driving techniques.",
    ctaMessage: "Contact us for more information",
    ctaText: "Inquire Now",
    ctaLink: "/contact",
    image:
      "https://res.cloudinary.com/dzi2p0pqa/image/upload/v1737148876/samples/corporate-programs-default.jpg",
  };

  // Usar contenido dinámico si está disponible, sino usar default
  const corporateProgramsSection =
    content?.corporateProgramsSection || defaultCorporateProgramsSection;

  // No mostrar si no hay contenido y está cargando
  if (loading) {
    return null;
  }

  // No mostrar si no hay corporateProgramsSection (opcional - solo si quieres que sea completamente configurable)
  if (!content?.corporateProgramsSection && !defaultCorporateProgramsSection) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-20">
      <div className="mx-auto" style={{ maxWidth: "1500px" }}>
        {/* Título Principal Centrado */}
        <h2 className="text-5xl font-extrabold mb-8 leading-tight text-center">
          <span className="text-[#27ae60]">
            {corporateProgramsSection.title.split(" ")[0]}{" "}
          </span>
          <span className="text-[#0056b3]">
            {corporateProgramsSection.title.split(" ").slice(1).join(" ")}
          </span>
        </h2>

        {/* Contenedor de Subtítulo/Descripción e Imagen */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 lg:space-x-8">
          {/* Texto - Lado Izquierdo */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            {/* Subtítulo */}
            <h3 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-[#0056b3]">
                {corporateProgramsSection.subtitle.split(" ")[0]}{" "}
              </span>
              <span className="text-black">Your</span>
              <br />
              <span className="text-[#27ae60]">
                {corporateProgramsSection.subtitle.split(" ").slice(-1)[0]}
              </span>
            </h3>

            {/* Descripción con saltos de línea preservados */}
            <div className="text-lg text-[#000000] leading-relaxed max-w-xl mx-auto lg:mx-0 text-justify space-y-4">
              {corporateProgramsSection.description
                .split("\n\n")
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>

            {/* CTA Message y Botón */}
            <div className="mt-6 space-y-4">
              <p className="text-lg font-semibold text-[#0056b3]">
                {corporateProgramsSection.ctaMessage}
              </p>
              <Link
                href={corporateProgramsSection.ctaLink}
                className="inline-block bg-[#0056b3] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#004494] transition-all duration-300 transform hover:scale-105"
              >
                {corporateProgramsSection.ctaText}
              </Link>
            </div>
          </div>

          {/* Imagen - Lado Derecho */}
          <motion.div
            className="w-full lg:w-1/2 lg:flex-shrink-0 overflow-hidden rounded-lg"
            initial={{ opacity: 0, x: 120 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <Image
              src={corporateProgramsSection.image}
              alt={corporateProgramsSection.title}
              width={900}
              height={400}
              className="w-full h-[260px] sm:h-[320px] md:h-[340px] lg:h-[360px] xl:h-[400px] object-cover shadow-md transition-all duration-500 hover:scale-110 hover:brightness-110 cursor-pointer"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CorporatePrograms;
