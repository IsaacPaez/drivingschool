"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaCalendarAlt } from "react-icons/fa";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Modal from "@/components/Modal";

export default function BookNowPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locations, setLocations] = useState<{ title: string; zone: string; instructors: Instructor[] }[]>([]);

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
    photo?: string;
    certifications?: string;
    experience?: string;
    schedule?: Schedule[]; // ✅ Ahora es opcional para evitar errores
  }

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/locations");
        if (!res.ok) {
          throw new Error(`Error al obtener las sedes: ${res.statusText} (${res.status})`);
        }
        const data = await res.json();
        setLocations(data);
      } catch (error) {
        console.error("❌ Error en la carga de sedes:", error);
      }
    }
    fetchLocations();
  }, []);

  const handleSelectLocation = (location: { title: string; zone: string; instructors: Instructor[] }) => {
    setSelectedLocation(location.zone);
    setInstructors(location.instructors);
    setSelectedInstructor(
      location.instructors.length > 0
        ? { ...location.instructors[0], schedule: location.instructors[0].schedule || [] } // ✅ Asegurando que `schedule` siempre esté presente
        : null
    );
    setIsModalOpen(false);
  };

  const handleSelectInstructor = (instructor: Instructor) => {
    setSelectedInstructor({
      ...instructor,
      schedule: instructor.schedule || [], // ✅ Asegurando que `schedule` nunca sea `undefined`
    });
    setSelectedDate(null);
    setSelectedSlots([]);
  };

  const handleDateChange: CalendarProps["onChange"] = (value) => {
    if (!value || Array.isArray(value)) return;
    const date = value as Date;
    setSelectedDate(date);

    if (!selectedInstructor) {
      console.error("🚨 selectedInstructor no está definido.");
      setSelectedSlots([]);
      return;
    }

    if (!selectedInstructor.schedule || !Array.isArray(selectedInstructor.schedule)) {
      console.error("⛔ selectedInstructor no tiene un horario definido:", JSON.stringify(selectedInstructor, null, 2));
      setSelectedSlots([]);
      return;
    }

    console.log("📅 Fecha seleccionada:", date.toISOString().split("T")[0]);
    console.log("📋 Horario del instructor:", selectedInstructor.schedule);

    const formattedDate = date.toISOString().split("T")[0];
    const selectedDay = selectedInstructor.schedule.find((day) => day.date === formattedDate);

    if (!selectedDay || !Array.isArray(selectedDay.slots) || selectedDay.slots.length === 0) {
      console.warn("⚠️ No hay horarios disponibles para esta fecha:", formattedDate);
      setSelectedSlots([]);
      return;
    }

    setSelectedSlots(selectedDay.slots);
  };

  return (
    <section className="bg-gray-50 pt-[120px] pb-20 px-6 sm:px-10 md:px-16 min-h-screen flex flex-col items-center">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Choose a Location</h2>
          <div className="flex flex-col space-y-2">
            {locations.length > 0 ? (
              locations.map((location) => (
                <button
                  key={location.zone}
                  onClick={() => handleSelectLocation(location)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition-all"
                >
                  {location.zone}
                </button>
              ))
            ) : (
              <p className="text-center text-gray-500">Loading locations...</p>
            )}
          </div>
        </div>
      </Modal>

      {!isModalOpen && (
        <div className="max-w-6xl w-full flex flex-col md:flex-row flex-wrap gap-10 mt-10 bg-white shadow-xl rounded-3xl p-8">
          {error && <div className="text-center text-red-500 font-semibold text-lg">{error}</div>}

          <motion.div className="w-full md:w-1/3 bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-4">Available Instructors</h2>
            <div className="flex flex-col space-y-3">
              {instructors.map((inst) => (
                <button
                  key={inst._id}
                  onClick={() => handleSelectInstructor(inst)}
                  className="w-full text-left py-3 px-5 rounded-lg transition-all duration-200 bg-indigo-100 text-gray-900 hover:bg-indigo-300"
                >
                  {inst.name}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div className="flex-1 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 mt-4">
            {selectedInstructor ? (
              <>
                <div className="text-center">
                  {selectedInstructor.photo ? (
                    <Image src={selectedInstructor.photo} alt={selectedInstructor.name} width={120} height={120} className="w-32 h-32 rounded-full mx-auto shadow-md" />
                  ) : null}
                  <h1 className="text-3xl font-bold text-gray-900 mt-4">{selectedInstructor.name}</h1>
                </div>

                <div className="mt-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                    <FaCalendarAlt className="text-blue-600" /> Available Schedules
                  </h3>
                  <Calendar onChange={handleDateChange} value={selectedDate} locale="en-US" className="border rounded-lg shadow-md w-full p-2 text-black" />
                  <div className="flex-1 bg-gray-100 p-4 rounded-lg shadow-md border border-gray-200 mt-4">
                    {selectedSlots.length > 0 ? (
                      selectedSlots.map((slot) => (
                        <span key={slot._id} className="block bg-green-400 text-white text-sm px-3 py-1 rounded-md mt-2">
                          {slot.start} - {slot.end}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No available schedules.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-lg text-center">Select an instructor to view details.</p>
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
}
