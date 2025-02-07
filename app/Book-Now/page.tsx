"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaCalendarAlt } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function BookNowPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  interface Slot {
    _id: string;
    start: string;
    end: string;
  }

  interface Schedule {
    date: string;
    slots: Slot[];
  }

  interface Instructor {
    _id: string;
    name: string;
    photo: string;
    certifications?: string;
    experience?: string;
    schedule: Schedule[];
  }

  useEffect(() => {
    async function fetchInstructors() {
      try {
        console.log("🔄 Intentando obtener instructores...");
        const res = await fetch("/api/book-now");
        if (!res.ok) {
          throw new Error(`Error al obtener los instructores: ${res.statusText} (${res.status})`);
        }
        const data = await res.json();
        console.log("✅ Datos de instructores recibidos:", data);
        setInstructors(data);
        if (data.length > 0) {
          setSelectedInstructor(data[0]);
        } else {
          setError("No hay instructores disponibles.");
        }
      } catch (error) {
        console.error("❌ Error en la carga de instructores:", error);
        setError("Error al obtener los instructores. Verifica la API.");
      }
    }
    fetchInstructors();
  }, []);

  return (
    <section className="bg-gray-100 pt-[120px] pb-20 px-4 sm:px-6 md:px-12 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row flex-wrap gap-8 mt-10">
        {error && <div className="text-center text-red-500 font-semibold text-lg">{error}</div>}

        {/* 📌 Lista de Instructores */}
        <motion.div className="w-full md:w-1/4 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 text-center md:text-left">
            Instructores Disponibles
          </h2>
          <div className="flex flex-col space-y-2">
            {instructors.map((inst) => (
              <button
                key={inst._id}
                onClick={() => setSelectedInstructor(inst)}
                className="w-full text-left py-3 px-5 rounded-lg transition-all duration-200 border text-base sm:text-lg bg-gray-50 text-gray-800 hover:bg-blue-100 border-gray-200"
              >
                {inst.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 📌 Detalles del Instructor con Calendario */}
        <motion.div className="flex-1 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 mt-4">
          {selectedInstructor ? (
            <>
              <div className="text-center">
                <Image src={selectedInstructor.photo} alt={selectedInstructor.name} width={120} height={120} className="w-32 h-32 rounded-full mx-auto shadow-md" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-4">{selectedInstructor.name}</h1>
              </div>

              <div className="mt-6 text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                  <FaCalendarAlt className="text-blue-600" /> Horarios Disponibles
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <Calendar
                    onChange={(date) => setSelectedDate(date as Date)}
                    value={selectedDate}
                    className="border rounded-lg shadow-md w-full md:w-1/2 p-2"
                  />
                  <div className="flex-1 bg-gray-50 p-4 rounded-lg shadow-md border border-gray-200">
                    {selectedDate ? (
                      selectedInstructor.schedule.some((day) => day.date === selectedDate.toISOString().split("T")[0]) ? (
                        selectedInstructor.schedule
                          .filter((day) => day.date === selectedDate.toISOString().split("T")[0])
                          .map((day) => (
                            <div key={day.date}>
                              {day.slots.map((slot) => (
                                <span
                                  key={slot._id}
                                  className="block bg-green-500 text-white text-sm px-3 py-1 rounded-md mt-2"
                                >
                                  {slot.start} - {slot.end}
                                </span>
                              ))}
                            </div>
                          ))
                      ) : (
                        <p className="text-gray-500 text-sm">No hay horarios disponibles para esta fecha.</p>
                      )
                    ) : (
                      <p className="text-gray-500 text-sm">Selecciona una fecha para ver los horarios disponibles.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-lg text-center">Selecciona un instructor para ver los detalles.</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
