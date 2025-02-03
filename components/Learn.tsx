"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Learn = () => {
  const features = [
    {
      image: "/profe.jpg",
      title: "Experienced Instructors",
      description:
        "Our instructors are certified and have over 25 years of teaching experience in Palm Beach County. They stay up-to-date with the latest driving techniques.",
    },
    {
      image: "/L8jpg.jpg",
      title: "Affordable Prices",
      description:
        "We offer competitive rates for our driving lessons, and our multi-lesson packages offer discounts. Save up to $330!",
    },
    {
      image: "/L3.jpg",
      title: "Easy Bookings",
      description:
        "Booking and payment are quick and stress-free with our online booking system. Choose your instructor, date, and service, and you're ready to go!",
    },
    {
      image: "/certif.jpg",
      title: "Certified Traffic Courses",
      description:
        "We offer accredited Florida Traffic Courses, including the required First-Time Driver course and various Ticket and Driving Improvement Courses.",
    },
    {
      image: "/L5.jpg",
      title: "Personalized Driving Lessons",
      description:
        "We tailor lessons for beginners, teenagers, and experienced drivers. Each lesson is customized for the student's experience.",
    },
    {
      image: "/linea.jpg",
      title: "Online Learning Options",
      description:
        "We offer flexible learning options, including online Traffic Courses and DVD versions of our 4hr Basic Driving Improvement Course.",
    },
  ];

  return (
    <section className="bg-white pt-10 pb-16">
      {/* Título con margen superior para mejor separación */}
      <h2 className="text-5xl text-center font-extrabold text-[#222] leading-tight mb-12">
        <span className="text-[#27ae60]">WHY </span> LEARN WITH{" "}
        <span className="text-[#0056b3]">US?</span>
      </h2>

      {/* Swiper Carrusel */}
      <div className="max-w-7xl mx-auto px-6 relative">
        <Swiper
          modules={[Pagination, Autoplay, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          loop
          className="w-full"
        >
          {features.map((feature, index) => (
            <SwiperSlide key={index}>
              <div className="relative rounded-lg overflow-hidden shadow-xl group transition-transform transform hover:scale-105">
                {/* Imagen de fondo */}
                <div
                  className="w-full h-56 sm:h-64 md:h-72 lg:h-80 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${feature.image})`,
                  }}
                ></div>

                {/* Superposición negra con animación de opacidad */}
                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-center text-white p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm mt-2">{feature.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Flechas minimalistas */}
        <div className="swiper-button-prev-custom absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md w-10 h-10 flex items-center justify-center rounded-full cursor-pointer hover:bg-[#27ae60] transition">
          <span className="text-2xl text-[#0056b3] hover:text-white font-bold">‹</span>
        </div>
        <div className="swiper-button-next-custom absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md w-10 h-10 flex items-center justify-center rounded-full cursor-pointer hover:bg-[#27ae60] transition">
          <span className="text-2xl text-[#0056b3] hover:text-white font-bold">›</span>
        </div>
      </div>
    </section>
  );
};

export default Learn;
