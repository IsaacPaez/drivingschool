"use client";

import React from "react";
import Link from "next/link";

const InformationForNervousDrivers = () => {
  return (
    <section className="bg-white min-h-screen pt-48 pb-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-10 border border-gray-200">
        <h1 className="text-4xl font-extrabold text-black mb-4 text-center">
          Information for Nervous Drivers and Parents
        </h1>
        <p className="text-gray-600 text-center">By Nelson</p>
        <div className="flex justify-center my-4">
          <Link href="/Article">
            <button className="bg-gray-300 text-black px-6 py-2 rounded-full font-semibold shadow-md hover:bg-gray-400 transition">
              Driving Lessons
            </button>
          </Link>
        </div>
        <hr className="my-6 border-gray-300" />
        
        <h2 className="text-2xl font-semibold text-black mb-4">Nervous Parent or Student?</h2>
        <p className="text-gray-800 leading-relaxed text-justify mb-6">
          Parents and/or students have nothing to worry about. We have professional, friendly, courteous, punctual and experienced driving instructors. Our instructors here at Affordable Driving Traffic School have been trained in the latest and modern methods of teaching and are all licensed by the Florida Department of Highway Safety and Motor Vehicles. It is the law in Florida that each instructor be licensed; in order to become a Licensed Driving Instructor, we must pass a Driving Instructor’s Course. Our Instructors are re-certified annually and in order to do so we must go through a background check. Additionally, our instructors must also complete a meticulous and extensive training program provided by our master Instructors here at Affordable Driving Traffic School. Even though, not required by the Florida Department of Highway Safety and Motor Vehicles all our Instructors are College Educated. Our instructors are also required to enhance their driving instruction knowledge and teaching methods by attending driving safety seminars and keep up with the latest driving training safety techniques and updated with the latest Florida State Traffic Statutes (Laws).
        </p>

        <h2 className="text-2xl font-semibold text-black mb-4">Still Nervous?</h2>
        <p className="text-gray-800 leading-relaxed text-justify">
          Vehicles for our driving lessons are late model and State licensed for driving instruction. Our vehicles are dual controlled with brakes and accelerator pedals, !!yes gas pedals!!, that always gives us (the instructors) total control of the vehicle from our side in case we need to take over in dangerous situations. Our cars don’t have dual steering wheel. Through the many years of driving teaching experience, we have perceived that the extra steering wheel doesn’t allow the students to feel the total control of the car and prevents the students to improve on their driving skills. Our vehicles are maintained mechanically on a routine basis to ensure the safety of our students as well as our instructors. Our vehicles are also monitored by a GPS tracking system, so we always know where our students are located while taking their driving lessons.
        </p>
      </div>
    </section>
  );
};

export default InformationForNervousDrivers;
