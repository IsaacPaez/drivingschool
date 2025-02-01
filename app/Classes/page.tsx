"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import ClassList from "./ClassList";
import TrafficLawClass from "./TrafficLawClass";
import BDIClass from "./BDICLass";
import IDIClass from "./IDIClass";
import ADIClass from "./ADIClass";
import AggressiveClass from "./AggressiveClass";
import CrashClass from "./CrashClass";
import SeniorInsuranceDiscount from "./SeniorInsuranceDiscount";
import MultiDayADIClass from "./MultiDayADIClass";
import YOCClass from "./YOCClass";
import Image from "next/image";

const classComponents: { [key: string]: React.ReactNode } = {
  trafficLaw: <TrafficLawClass />,
  bdiClass: <BDIClass />,
  idiClass: <IDIClass />,
  adiClass: <ADIClass />,
  aggressiveClass: <AggressiveClass />,
  crashClass: <CrashClass />,
  seniorDiscount: <SeniorInsuranceDiscount />,
  multiDayClass: <MultiDayADIClass />,
  yocClass:<YOCClass/>, // Agregar componente YOCClass
};

const ClassesPage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState("trafficLaw");

  return (
    <section className="bg-gray-100 py-16 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        {/* 📌 Imagen superior en dispositivos móviles */}
        <div className="w-full md:hidden mb-6">
          <Image
            src="/DD.jpg" // Imagen nueva sugerida
            alt="Driving Education"
            width={1200}
            height={500}
            className="rounded-lg shadow-lg"
          />
        </div>

        {/* 📌 Lista de clases a la izquierda */}
        <motion.div
          className="w-full md:w-[340px] bg-white p-6 rounded-lg shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ClassList selectedClass={selectedClass} setSelectedClass={setSelectedClass} />
        </motion.div>

        {/* 📌 Contenido dinámico a la derecha */}
        <motion.div
          className="flex-1 bg-white p-6 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {classComponents[selectedClass]}
        </motion.div>
      </div>
    </section>
  );
};

export default ClassesPage;
