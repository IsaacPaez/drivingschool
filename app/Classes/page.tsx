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
import MultiDayADIClass from "./MultiDayADIClass"; // Ensure the file exists and the path is correct
// Agrega más clases conforme las vayas creando

const classComponents: { [key: string]: React.ReactNode } = {
  trafficLaw: <TrafficLawClass />,
  bdiClass: <BDIClass />,
  idiClass: <IDIClass />,
  adiClass: <ADIClass />,
  aggressiveClass: <AggressiveClass />,
  crashClass: <CrashClass />,
  seniorDiscount: <SeniorInsuranceDiscount />,
  multiDayClass: <MultiDayADIClass />, // Nueva clase agregada
  // Agrega más clases conforme las vayas creando
};

const ClassesPage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState("trafficLaw"); // Estado inicial

  return (
    <section className="bg-white py-16 px-8">
      <div className="max-w-7xl mx-auto flex gap-12">
        {/* 📌 Lista de clases a la izquierda (sticky en lugar de fixed) */}
        <motion.div
          className="w-[300px] sticky top-34 self-start"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ClassList
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
          />
        </motion.div>

        {/* 📌 Contenido dinámico a la derecha */}
        <motion.div
          className="flex-1"
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
