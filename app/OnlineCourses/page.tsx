"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CourseList from "./CourseList";
import LawSubstance from "./LawSubstance";
import BasicDriving from "./BasicDriving";
import AdvancedDriving from "./AdvancedDriving";
import SeniorInsurance from "./SeniorInsurance";
import IntermediateDriving from "./IntermediateDriving";
import DVDZipRequest from "./DVDZipRequest"; // Importamos el nuevo componente
//import IntermediateDriving from "./courses/IntermediateDriving";

const courseComponents: { [key: string]: React.ReactNode } = {
  lawSubstance: <LawSubstance />,
  basicDriving: <BasicDriving />,
  advancedDriving: <AdvancedDriving />,
  seniorInsurance: <SeniorInsurance />,
  intermediateDriving: <IntermediateDriving />,
  //intermediateDriving: <IntermediateDriving />,
};

const OnlineCourses: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState("lawSubstance");

  return (
    <>
      <section className="relative h-screen w-full overflow-hidden bg-black">
        <Image
          src="/background.jpeg"
          alt="Driving Courses"
          layout="fill"
          objectFit="cover"
          className="opacity-50"
        />
        <div className="relative z-10 flex h-full max-w-7xl mx-auto px-8">
          <motion.div
            className="w-1/2 flex flex-col justify-center text-white space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCourse}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                {courseComponents[selectedCourse]}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="w-1/2 flex flex-col justify-center items-end"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CourseList
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
            />
          </motion.div>
        </div>
      </section>

      {/* Nueva Sección de Solicitud de DVD y ZIP/PDF */}
      <DVDZipRequest />
    </>
  );
};

export default OnlineCourses;
