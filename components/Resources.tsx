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
    <section className="bg-[#f9f9f9] py-16">
      <h2 className="text-4xl font-extrabold text-center text-black mb-12">
        Resources
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-6">
        {resources.map((resource, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg flex flex-col items-center text-center p-4 h-48 transition-transform duration-300 hover:shadow-xl"
          >
            <div className="flex items-center justify-center h-24 mb-4">
              <Image
                src={resource.image}
                alt={resource.title}
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            {/* 📌 Si el recurso es FAQ, lo envolvemos en un Link */}
            {resource.href ? (
              <Link href={resource.href} scroll={true}>
                <h3 className="text-lg font-bold text-black hover:text-[#0056b3] transition-colors duration-300 cursor-pointer">
                  {resource.title}
                </h3>
              </Link>
            ) : (
              <h3 className="text-lg font-bold text-black hover:text-[#0056b3] transition-colors duration-300">
                {resource.title}
              </h3>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Resources;
