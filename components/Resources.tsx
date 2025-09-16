"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ResourceItem {
  title: string;
  image: string;
  href?: string;
}

const Resources = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const resources: ResourceItem[] = [
    { title: "FAQ", image: "/pregunta.png", href: "/FAQ" },
    { title: "FL Drivers License Check", image: "/lupa.jpg", href: "https://services.flhsmv.gov/DLCheck/" },
    { title: "License & ID Requirements", image: "/licenciajpg.jpg" },
    { title: "Florida DMV", image: "/bucle.jpg", href: "https://www.flhsmv.gov/" },
    { title: "DMV Appointment", image: "/conojpg.jpg", href: "https://www.flhsmv.gov/locations/" },
    { title: "FL Drivers License Handbook (ENG)", image: "/manual1.1jpg.jpg" },
    { title: "FL Manual De Manejo (ESP)", image: "/manual2.1.jpg" },
    { title: "Forms", image: "/forms1.jpg", href: "https://www.flhsmv.gov/forms/" },
  ];

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Duplicar resources para efecto infinito SOLO en móvil
  const duplicatedResources = isMobile ? [...resources, ...resources] : resources;

  // Carousel automático SOLO en móvil
  useEffect(() => {
    if (!isMobile) return; // No hacer carousel en PC
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= resources.length) {
          return 0;
        }
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [resources.length, isMobile]);

  return (
    <div style={{overflowX: isMobile ? 'hidden' : 'visible', position: 'relative', width: '100%'}}>
      <section className="bg-white py-12">
        <h2 className="text-4xl font-extrabold text-center text-[#000000] mb-8">
          Resources
        </h2>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4" style={{maxWidth: '1500px'}}>
          
          {/* VISTA MÓVIL: Carousel automático */}
          {isMobile && (
            <div className="relative overflow-hidden md:hidden">
              <div 
                className="flex transition-transform duration-1000 ease-in-out gap-4 justify-center"
                style={{
                  transform: `translateX(-${(currentIndex * 150)}px)`,
                }}
              >
                {duplicatedResources.map((resource, index) => (
                  <div
                    key={`${resource.title}-${index}`}
                    className="min-w-[140px] max-w-[160px] h-[200px] bg-white rounded-2xl border border-[#e5e7eb] flex flex-col items-center justify-center text-center p-3 mx-1 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-[#27ae60] group cursor-pointer"
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
                        <h3 className="text-base font-bold text-black group-hover:text-[#0056b3] transition-colors duration-300 mt-1">
                          {resource.title}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="text-base font-bold text-black group-hover:text-[#0056b3] transition-colors duration-300 mt-1">
                        {resource.title}
                      </h3>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Indicadores de progreso solo en móvil */}
              <div className="flex justify-center mt-6 gap-2">
                {resources.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-[#27ae60] w-6' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* VISTA PC: Una sola fila, sin wrap, tamaño fluido con clamp */}
          {!isMobile && (
            <div className="hidden md:flex gap-6 flex-nowrap justify-center">
              {resources.map((resource, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-[#e5e7eb] flex flex-col items-center justify-center text-center p-3 mx-1 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-[#27ae60] group cursor-pointer
                             w-[clamp(120px,9vw,180px)] h-[clamp(170px,14vw,200px)]"
                  style={{ flex: '0 0 auto' }}
                >
                  <div className="flex items-center justify-center mb-3 rounded-full bg-white transition-all duration-300 overflow-hidden
                                  h-[clamp(48px,4.8vw,72px)] w-[clamp(48px,4.8vw,72px)]">
                    <Image
                      src={resource.image}
                      alt={resource.title}
                      width={72}
                      height={72}
                      className="object-contain w-[clamp(36px,3.6vw,56px)] h-[clamp(36px,3.6vw,56px)]"
                    />
                  </div>
                  {resource.href ? (
                    <Link href={resource.href} scroll={true}>
                      <h3 className="text-base font-bold text-black group-hover:text-[#0056b3] transition-colors duration-300 mt-1">
                        {resource.title}
                      </h3>
                    </Link>
                  ) : (
                    <h3 className="text-base font-bold text-black group-hover:text-[#0056b3] transition-colors duration-300 mt-1">
                      {resource.title}
                    </h3>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Resources;
