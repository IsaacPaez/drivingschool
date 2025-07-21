"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";


const Resources = () => {
  const resources = [
    { title: "FAQ", image: "/pregunta.png", href: "/FAQ" }, // 📌 Agregamos href para FAQ
    { title: "FL Drivers License Check", image: "/lupa.jpg", href: "https://services.flhsmv.gov/DLCheck/" },
    { title: "License & ID Requirements", image: "/licenciajpg.jpg" },
    { title: "Florida DMV", image: "/bucle.jpg", href: "https://www.flhsmv.gov/" },
    { title: "DMV Appointment", image: "/conojpg.jpg", href: "https://www.flhsmv.gov/locations/" },
    { title: "FL Drivers License Handbook (ENG)", image: "/manual1.1jpg.jpg" },
    { title: "FL Manual De Manejo (ESP)", image: "/manual2.1.jpg" },
    { title: "Forms", image: "/forms1.jpg", href: "https://www.flhsmv.gov/forms/" },
  ];

  return (
    <div style={{overflowX: 'visible', position: 'relative', width: '100%'}}>
      <section className="bg-white py-12">
        <h2 className="text-4xl font-extrabold text-center text-[#000000] mb-8">
          Resources
        </h2>
        <div className="max-w-6xl mx-auto px-2 md:px-6 pt-4" style={{maxWidth: '1500px'}}>
          {/* Fila horizontal con scroll en todos los tamaños */}
          <div className="flex gap-4 overflow-x-auto overflow-visible pb-2 scrollbar-thin scrollbar-thumb-[#27ae60]/60 scrollbar-track-transparent justify-center">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="min-w-[140px] max-w-[160px] h-[200px] bg-white rounded-2xl border border-[#e5e7eb] flex flex-col items-center justify-center text-center p-2 mx-0.5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-[#27ae60] group cursor-pointer"
                style={{ flex: '0 0 150px' }}
              >
                <div className="flex items-center justify-center h-18 w-18 mb-3 rounded-full bg-white transition-all duration-300 overflow-hidden" style={{height:'72px',width:'72px'}}>
                  <Image
                    src={resource.image}
                    alt={resource.title}
                    width={64}
                    height={64}
                    className="object-contain w-12 h-12"
                  />
                </div>
                {resource.href ? (
                  <Link href={resource.href} scroll={true}>
                    <h3 className="text-[15px] md:text-base font-bold text-black group-hover:text-[#0056b3] transition-colors duration-300 mt-1">
                      {resource.title}
                    </h3>
                  </Link>
                ) : (
                  <h3 className="text-[15px] md:text-base font-bold text-black group-hover:text-[#0056b3] transition-colors duration-300 mt-1">
                    {resource.title}
                  </h3>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;
