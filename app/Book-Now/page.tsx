"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaCalendarAlt } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Modal from "@/components/Modal";

export default function BookNowPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true);
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
    schedule?: Schedule[];
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
    setInstructors(location.instructors);
    setSelectedInstructor(location.instructors.length > 0 ? location.instructors[0] : null);
    setIsModalOpen(false);
  };

  const handleDateChange = (value: Date | Date[] | null) => {
    if (!value || Array.isArray(value)) return; // Evita valores nulos o rangos de fechas
    const date = value as Date;
    setSelectedDate(date);

    if (!selectedInstructor || !selectedInstructor.schedule) {
      console.warn("⛔ selectedInstructor no tiene un horario definido.");
      setSelectedSlots([]);
      return;
    }

    const formattedDate = date.toISOString().split("T")[0];
    const selectedDay = selectedInstructor.schedule.find((day) => day.date === formattedDate);

    if (!selectedDay || !selectedDay.slots || selectedDay.slots.length === 0) {
      console.warn("⚠️ No hay horarios disponibles para esta fecha:", formattedDate);
      setSelectedSlots([]);
      return;
    }

    setSelectedSlots(selectedDay.slots);
  };

  return (
    <section className="bg-gray-50 pt-[120px] pb-20 px-6 sm:px-10 md:px-16 min-h-screen flex flex-col items-center">
      {/* 📌 Modal para seleccionar la sede */}
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

      {/* 📌 Sección Principal (si el modal ya fue cerrado) */}
      {!isModalOpen && (
        <div className="max-w-6xl w-full flex flex-col md:flex-row flex-wrap gap-10 mt-10 bg-white shadow-xl rounded-3xl p-8">
          {/* 📌 Lista de Instructores */}
          <motion.div className="w-full md:w-1/3 bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-4">Available Instructors</h2>
            <div className="flex flex-col space-y-3">
              {instructors.map((inst) => (
                <button
                  key={inst._id}
                  onClick={() => setSelectedInstructor(inst)}
                  className="w-full text-left py-3 px-5 rounded-lg transition-all duration-200 bg-indigo-100 text-gray-900 hover:bg-indigo-300"
                >
                  {inst.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* 📌 Detalles del Instructor */}
          <motion.div className="flex-1 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 mt-4">
            {selectedInstructor ? (
              <>
                <div className="text-center">
                  {selectedInstructor.photo ? (
                    <Image
                      src={selectedInstructor.photo}
                      alt={selectedInstructor.name}
                      width={120}
                      height={120}
                      className="w-32 h-32 rounded-full mx-auto shadow-md"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 mt-4">{selectedInstructor.name}</h1>
                  {selectedInstructor.experience && (
                    <p className="text-lg text-gray-700 mt-2">Experience: {selectedInstructor.experience}</p>
                  )}
                  {selectedInstructor.certifications && (
                    <p className="text-lg text-gray-700">Certifications: {selectedInstructor.certifications}</p>
                  )}
                </div>

                {/* 📌 Calendario y Horarios */}
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                    <FaCalendarAlt className="text-blue-600" /> Available Schedules
                  </h3>
                  <Calendar
                    onChange={(value) => handleDateChange(value as Date | null)}
                    value={selectedDate}
                    locale="en-US"
                    className="border rounded-lg shadow-md w-full p-2 text-black"
                  />

                  {/* 📌 Mostrar horarios disponibles */}
                  <div className="flex-1 bg-gray-100 p-4 rounded-lg shadow-md border border-gray-200 mt-4">
                    {selectedSlots.length > 0 ? (
                      selectedSlots.map((slot) => (
                        <span key={slot._id} className="block bg-green-400 text-white text-sm px-3 py-1 rounded-md mt-2">
                          {slot.start} - {slot.end}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Select a date to view available schedules.</p>
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
