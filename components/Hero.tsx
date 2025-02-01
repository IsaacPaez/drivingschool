  "use client";

  import React from "react";
  import Link from "next/link";

  const Hero = () => {
    return (
      <section
        className="relative bg-cover bg-center h-screen"
        style={{ backgroundImage: "url('/8.jpg')" }} // Asegúrate de que el path sea correcto
      >
        {/* Contenedor principal */}
        <div className="max-w-7xl mx-auto pt-40 flex flex-col items-start">
          {/* Título */}
          <h1 className="text-5xl mt-8 font-extrabold text-white leading-tight mb-6">
            Learn To Drive<br /> Safely For Life
          </h1>

          {/* Subtítulo */}
          <p className="text-xl text-white font-semibold mb-8">
            Affordable Driving School offers professional<br /> Behind the Wheel Driving Lessons and Traffic <br />
            School Courses in Palm Beach County.
          </p>

          {/* Contenedor de estadísticas */}
        <div className="bg-white/30 backdrop-blur-sm shadow-lg rounded-lg px-8 py-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h2 className="text-4xl font-bold text-black">9,000<span className="text-[#4CAF50]">+</span></h2>
              <p className="text-lg text-black">Students</p>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-black">2,000<span className="text-[#4CAF50]">+</span></h2>
              <p className="text-lg text-black">Teachers</p>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-black">5,000<span className="text-[#4CAF50]">+</span></h2>
              <p className="text-lg text-black">Lessons</p>
            </div>
          </div>
        </div>

          {/* Botones */}
          <div className="flex flex-row gap-4">
            <Link
              href="/book-driving-lessons"
              className="bg-[#4CAF50] text-white text-xl px-4 py-4 rounded-full border-white hover:bg-[#0056b3] text-center"
            >
              Book Driving Lessons
            </Link>
            <Link
              href="/book-traffic-ticket-class"
              className="bg-white text-[#4CAF50] text-lg px-4 py-4 rounded-full border border-white hover:bg-[#0056b3] hover:text-white text-center"
            >
              Book a Traffic Ticket Class
            </Link>
          </div>
        </div>
      </section>
    );
  };

  export default Hero;
