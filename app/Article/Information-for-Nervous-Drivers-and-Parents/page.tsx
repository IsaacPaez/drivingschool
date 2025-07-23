"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { motion } from "framer-motion";

function Title({ green, black, blue, className = "" }) {
  return (
    <h1 className={clsx("text-4xl md:text-6xl font-extrabold mb-6 text-center leading-tight", className)}>
      <span className="text-green-600">{green} </span>
      <span className="text-black">{black} </span>
      <span className="text-blue-600">{blue}</span>
    </h1>
  );
}

function fadeInUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay },
    viewport: { once: true, amount: 0.2 },
  };
}

function Page() {
  return (
    <section className="bg-slate-50 min-h-screen pt-32 pb-16 px-2 md:px-6 lg:px-10 flex justify-center">
      <motion.div
        className="w-full max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-6 md:p-10 border border-gray-200 relative z-10"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div className="mb-10" {...fadeInUp(0)}>
          <Title green="Complete Guide" black="for Nervous Drivers" blue="and Concerned Parents" />
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-slate-700 font-semibold text-lg">Expert Guidance by Nelson</p>
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
        </motion.div>
        <motion.div className="flex flex-col md:flex-row gap-8 items-center mb-10" {...fadeInUp(0.1)}>
          <div className="flex-1 flex justify-center">
            <div className="relative bg-white rounded-xl p-2 shadow-lg border border-slate-200">
              <Image
                src="/profe.jpg"
                alt="Professional Driving Instructor"
                width={350}
                height={260}
                className="rounded-lg object-cover shadow"
                priority
              />
              <div className="absolute bottom-4 left-4 text-white drop-shadow-lg">
                <p className="font-bold text-lg">Professional Instruction</p>
                <p className="text-sm opacity-90">Licensed & Experienced</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <Link href="/Article">
              <button className="bg-green-600 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow transition-all">
                &lt; Back to Driving Articles
              </button>
            </Link>
            <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
              <p className="text-slate-700 text-center text-lg">
                "Empowering nervous drivers and parents with clear, expert guidance and a proven approach."
              </p>
            </div>
          </div>
        </motion.div>
        {/* Nervous Parent or Student Section */}
        <motion.div className="mb-12" {...fadeInUp(0.15)}>
          <Title green="Are You a Nervous" black="Parent" blue="or Student?" className="text-3xl md:text-4xl mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-l-4 border-blue-600 rounded-xl shadow p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Why Choose Our Professional Instructors?</h3>
              <p className="text-slate-700 text-justify">
                Parents and students can rest assured with our <span className="font-semibold text-blue-600">professional, friendly, courteous, punctual and experienced driving instructors</span>. Our team at <span className="font-bold text-green-600">Affordable Driving Traffic School</span> has been trained using the latest and most modern teaching methods, and all instructors are licensed by the Florida Department of Highway Safety and Motor Vehicles.
              </p>
            </div>
            <div className="bg-white border-l-4 border-green-600 rounded-xl shadow p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Legal Requirements & Certification</h3>
              <p className="text-slate-700 text-justify">
                It’s mandatory in Florida that every instructor be licensed. To become a Licensed Driving Instructor, we must successfully complete a comprehensive Driving Instructor’s Course. Our instructors undergo <span className="font-semibold text-green-600">annual re-certification</span> and thorough background checks, ensuring the highest standards of safety and professionalism.
              </p>
            </div>
          </div>
          <div className="bg-slate-100 rounded-xl p-6 border border-slate-200 mt-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Educational Excellence & Continuous Training</h3>
            <p className="text-slate-700 text-lg mb-4">
              Even though not required by the Florida Department of Highway Safety and Motor Vehicles, all our instructors are <span className="font-semibold text-blue-600">College Educated</span>. Our commitment to excellence extends beyond basic requirements - our instructors continuously enhance their knowledge by:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-1">
              <li>Attending advanced driving safety seminars and workshops</li>
              <li>Staying updated with the latest driving training safety techniques</li>
              <li>Maintaining current knowledge of Florida State Traffic Statutes and Laws</li>
              <li>Completing extensive training programs provided by our master instructors</li>
            </ul>
          </div>
        </motion.div>
        {/* What Sets Us Apart Section */}
        <motion.div className="mb-12" {...fadeInUp(0.2)}>
          <Title green="Still Feeling" black="Nervous?" blue="What Sets Us Apart" className="text-3xl md:text-4xl mb-8" />
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            <div className="md:col-span-2 flex flex-col h-full">
              <div className="bg-white border-l-4 border-green-600 rounded-xl shadow p-6 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">State-of-the-Art Vehicle Safety Features</h3>
                <p className="text-slate-700 mb-4">
                  Our vehicles for driving lessons are <span className="font-semibold text-green-600">late model and State licensed</span> for driving instruction. Every vehicle is equipped with <span className="font-bold text-blue-600">dual controlled brakes and accelerator pedals (yes, gas pedals!)</span>, giving our instructors complete control from the passenger side whenever necessary for dangerous situations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-1">No Dual Steering Wheels</h4>
                    <p className="text-slate-700 text-sm">
                      Through years of experience, we’ve found that dual steering wheels prevent students from feeling total control and hinder skill development. Our approach lets you truly master vehicle control.
                    </p>
                  </div>
                  <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-1">Regular Maintenance</h4>
                    <p className="text-slate-700 text-sm">
                      All vehicles undergo routine mechanical maintenance to ensure the <span className="font-semibold text-green-600">safety of our students</span> and instructors at all times.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col h-full">
              <div className="bg-white border-l-4 border-blue-600 rounded-xl shadow p-6 flex flex-col h-full">
                <h4 className="text-xl font-bold text-slate-800 mb-2">GPS Tracking System</h4>
                <p className="text-slate-700 mb-2">
                  Our vehicles are monitored by a <span className="font-semibold text-blue-600">GPS tracking system</span>, so we always know where our students are located during their driving lessons.
                </p>
                <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                  <h5 className="font-semibold text-slate-800 mb-1">Safety Benefits:</h5>
                  <ul className="text-sm text-slate-600 list-disc pl-4">
                    <li>Real-time location monitoring</li>
                    <li>Emergency response capability</li>
                    <li>Route optimization</li>
                    <li>Parent peace of mind</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Confidence Building Section */}
        <motion.div className="mb-12" {...fadeInUp(0.25)}>
          <Title green="Building Confidence:" black="Our Proven" blue="Approach" className="text-3xl md:text-4xl mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow p-6 text-center border-t-4 border-green-600">
              <h4 className="font-bold mb-2 text-slate-800">Patient Instruction</h4>
              <p className="text-slate-700 text-sm">Our instructors understand nerves and adapt their teaching pace to each student’s comfort level.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center border-t-4 border-blue-600">
              <h4 className="font-bold mb-2 text-slate-800">Gradual Progression</h4>
              <p className="text-slate-700 text-sm">We start with quiet streets and gradually build up to more challenging driving environments.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center border-t-4 border-green-600">
              <h4 className="font-bold mb-2 text-slate-800">Emotional Support</h4>
              <p className="text-slate-700 text-sm">We provide encouragement and positive reinforcement to boost confidence behind the wheel.</p>
            </div>
          </div>
        </motion.div>
        {/* Driving Image Section */}
        <motion.div className="mb-12" {...fadeInUp(0.3)}>
          <div className="relative bg-white rounded-2xl p-2 shadow-xl border border-slate-200">
            <Image
              src="/carretera.jpg"
              alt="Safe Driving on the Road"
              width={800}
              height={400}
              className="rounded-xl object-cover shadow w-full"
            />
            <div className="absolute bottom-6 left-6 text-white drop-shadow-lg">
              <h3 className="font-bold text-2xl mb-1">Master the Roads with Confidence</h3>
              <p className="text-lg opacity-90">From quiet neighborhoods to busy highways - we’ll guide you every step of the way</p>
            </div>
          </div>
        </motion.div>
        {/* Call-to-action section mejorada */}
        <motion.div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-8 bg-slate-100 rounded-2xl border-2 border-slate-200 text-center shadow-xl px-6 py-8 max-w-6xl mx-auto relative overflow-visible" {...fadeInUp(0.4)}>
          {/* Texto y botones */}
          <div className="flex-1 min-w-[260px] text-left lg:pr-8">
            <h2 className="text-xl md:text-2xl font-extrabold mb-2">
              <span className="text-green-600">Ready to Start </span>
              <span className="text-black">Your Driving </span>
              <span className="text-blue-600">Journey?</span>
            </h2>
            <p className="text-slate-700 mb-4 text-base md:text-lg max-w-xl">
              Don’t let nerves hold you back! Our professional instructors are here to guide you every step of the way. Join thousands of satisfied students who have overcome their driving anxiety with our proven methods.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mt-2">
              <Link href="/Book-Now">
                <button className="bg-green-600 hover:bg-blue-600 text-white px-7 py-3 rounded-full font-bold text-base shadow transition-all">
                  Book Your Lesson Now
                </button>
              </Link>
              <Link href="/contact">
                <button className="bg-blue-600 hover:bg-green-600 text-white px-7 py-3 rounded-full font-bold text-base shadow transition-all">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
          {/* Imagen del carro */}
          <div className="flex-1 flex justify-center items-center relative min-w-[220px] mt-6 lg:mt-0">
            <Image
              src="/car_ds.png"
              alt="Driving School Car"
              width={340}
              height={180}
              className="object-contain drop-shadow-2xl rounded-xl"
              priority
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Page;
