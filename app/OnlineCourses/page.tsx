"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CourseList from "./CourseList";
import LawSubstance from "./LawSubstance";
import BasicDriving from "./BasicDriving";
import AdvancedDriving from "./AdvancedDriving";
import SeniorInsurance from "./SeniorInsurance";
import IntermediateDriving from "./IntermediateDriving";
import DVDZipRequest from "./DVDZipRequest";

const courseComponents: { [key: string]: React.ReactNode } = {
  lawSubstance: <LawSubstance />,
  basicDriving: <BasicDriving />,
  advancedDriving: <AdvancedDriving />,
  seniorInsurance: <SeniorInsurance />,
  intermediateDriving: <IntermediateDriving />,
};

const OnlineCourses: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>("lawSubstance"); // ✅ Se inicializa con un valor por defecto

  return (
    <>
      {/* 🔹 Sección con fondo sólido */}
      <section className="relative h-screen w-full overflow-hidden bg-[#f5f5f5] flex flex-col justify-end">
        
        {/* 🔹 Contenedores en una fila en la parte inferior */}
        <motion.div
          className="grid grid-cols-5 gap-4 w-full px-8 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CourseList selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} />
        </motion.div>

        {/* 🔹 Contenedor para la descripción y la imagen */}
        <motion.div
          className="flex w-full px-8 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 🔹 Descripción a la izquierda */}
          <div className="w-1/2 pr-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCourse}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {courseComponents[selectedCourse]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 🔹 Imagen a la derecha */}
          <div className="w-1/2 flex justify-center items-center">
            <motion.img
              key={selectedCourse}
              src={`/images/${selectedCourse}.jpg`} // ✅ Asegúrate de que las imágenes existan en /public/images
              alt={selectedCourse}
              className="rounded-lg shadow-lg w-full max-h-80 object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </section>

      {/* Nueva Sección de Solicitud de DVD y ZIP/PDF */}
      <DVDZipRequest />
    </>
  );
};

export default OnlineCourses;
