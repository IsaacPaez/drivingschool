"use client";

import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Modal from "@/components/Modal";
import Image from "next/image";
import useDrivingLessons from "@/app/hooks/useDrivingLessons";

export default function BookNowPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const lessons = useDrivingLessons("Road Skills for Life");
  const [lessonPrice, setLessonPrice] = useState<number>(0);

  const [selectedInstructor, setSelectedInstructor] =
    useState<Instructor | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [locations, setLocations] = useState<
    { title: string; zone: string; instructors: Instructor[] }[]
  >([]);

  const fetchedInstructors = useRef(new Set());

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
    schedule?: Schedule[];
  }

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/locations");
        if (!res.ok) {
          throw new Error(
            `Error fetching locations: ${res.statusText} (${res.status})`
          );
        }
        const data = await res.json();
        setLocations(data);
      } catch (error) {
        console.error("❌ Error loading locations:", error);
      }
    }
    fetchLocations();
  }, []);

   // ✅ 2️⃣ Obtener el precio de la lección con "Book Now"
   useEffect(() => {
    const lesson = lessons.find((lesson) => lesson.buttonLabel === "Book Now");
    if (lesson) {
      setLessonPrice(lesson.price);
    }
  }, [lessons]);

  useEffect(() => {
    if (!selectedInstructor) return;
    if (fetchedInstructors.current.has(selectedInstructor._id)) return;

    let isMounted = true;

    async function fetchInstructorSchedule() {
      try {
        const res = await fetch(`/api/book-now?id=${selectedInstructor?._id}`);
        if (!res.ok)
          throw new Error(
            `Error fetching schedule: ${res.statusText} (${res.status})`
          );

        const data = await res.json();

        if (isMounted) {
          setSelectedInstructor((prev) =>
            prev ? { ...prev, schedule: data.schedule } : null
          );
          if (selectedInstructor) {
            fetchedInstructors.current.add(selectedInstructor._id);
          }
        }
      } catch (error) {
        console.error("❌ Error loading schedule:", error);
      }
    }

    fetchInstructorSchedule();

    return () => {
      isMounted = false;
    };
  }, [selectedInstructor]);

  const handleSelectLocation = (location: {
    title: string;
    zone: string;
    instructors: Instructor[];
  }) => {
    setInstructors(location.instructors);
    setSelectedInstructor(null);
    setIsModalOpen(false);
  };

  const handleDateChange = (value: Date | Date[] | null) => {
    if (!value || Array.isArray(value)) return;
    setSelectedDate(value);
  };

  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Mueve al domingo
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const renderScheduleTable = () => {
    if (!selectedInstructor || !selectedDate)
      return (
        <p className="text-gray-500 text-center">
          Select a date and instructor.
        </p>
      );
  
    const weekDates = getWeekDates(selectedDate);
    const scheduleByDate = new Map(
      selectedInstructor.schedule?.map((sched) => [sched.date, sched.slots]) || []
    );
  
    const allTimes = [];
    for (let h = 8; h < 20; h++) {
      allTimes.push(`${h}:00`, `${h}:15`, `${h}:30`, `${h}:45`);
    }
  
    return (
      <div className="overflow-x-auto w-full mt-6">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border border-gray-300 p-2">Time</th>
              {weekDates.map((date) => (
                <th
                  key={date.toDateString()}
                  className="border border-gray-300 p-2"
                >
                  <span className="block font-bold">
                    {date.toLocaleDateString("en-US", { weekday: "long" })}
                  </span>
                  <span className="block">
                    {date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allTimes.map((time, index) => {
              return (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 p-2 font-bold">{time}</td>
                  {weekDates.map((date) => {
                    const dateString = date.toISOString().split("T")[0];
                    const slots = scheduleByDate.get(dateString) || [];
  
                    // Agrupar bloques continuos de "booked"
                    let mergedSlot = null;
                    for (const slot of slots) {
                      const startHour = slot.start.split("T")[1].substring(0, 5);
                      if (startHour === time) {
                        mergedSlot = slot;
                        break;
                      }
                    }
  
                    return (
                      <td
                        key={date.toDateString()}
                        rowSpan={mergedSlot ? 2 : 1} // Combina dos filas si está ocupado
                        className={`border border-gray-300 p-4 ${
                          mergedSlot
                            ? "bg-[#27ae60] text-white text-center cursor-pointer align-middle"
                            : ""
                        }`}
                        onClick={() =>
                          mergedSlot &&
                          openBookingModal({
                            _id: mergedSlot._id,
                            start: mergedSlot.start,
                            end: mergedSlot.end,
                          })
                        }
                      >
                        {mergedSlot ? "Book Now" : ""}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  

  //Reserva
  // Estado para controlar el modal de reserva y el slot seleccionado
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  // Función para abrir el modal de reserva al hacer clic en "Book Now"
  const openBookingModal = (slot: Slot) => {
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
    setSelectedPrice(lessonPrice); // ✅ 3️⃣ Actualizar precio con la lección correcta
  };

  // Modal de reserva con detalles del instructor y horario seleccionado
  const renderBookingModal = () => (
    <Modal
      isOpen={isBookingModalOpen}
      onClose={() => setIsBookingModalOpen(false)}
    >
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2">Booking Details</h2>
        <p>
          <strong>Date:</strong> {selectedDate?.toDateString()}
        </p>
        <p>
          <strong>Time:</strong> {selectedSlot?.start.split("T")[1]}
        </p>
        <p>
          <strong>Instructor:</strong> {selectedInstructor?.name}
        </p>
        <p>
          <strong>Available Time:</strong> 2 hours
        </p>
        <p>
          <strong>Booking Length:</strong> 0 mins
        </p>

        {/* Opciones de servicio */}
        <div className="mt-4">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2 text-left">Service</th>
                <th className="border p-2 text-right">2 hours</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Driving Lesson - Meet on site</td>
                <td className="border p-2 text-right">
                  <input
                    type="radio"
                    name="service"
                    className="mr-2"
                    value={170}
                    checked={selectedPrice === lessonPrice}
                    onChange={() => setSelectedPrice(lessonPrice)}
                  />
                   ${lessonPrice}
                </td>
              </tr>
              <tr>
                <td className="border p-2">Driving Lesson - Pickup</td>
                <td className="border p-2 text-right">
                  <input
                    type="radio"
                    name="service"
                    className="mr-2"
                    value={200}
                    checked={selectedPrice === lessonPrice}
                    onChange={() => setSelectedPrice(lessonPrice)}
                  />
                   ${lessonPrice}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Botón de confirmación */}
        <div className="mt-4 flex justify-center">
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded"
            
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );

  

  return (
    <section className="bg-white pt-44 pb-10 px-6 flex flex-col items-center">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Choose a Location
          </h2>
          <div className="flex flex-col space-y-2">
            {locations.length > 0 ? (
              locations.map((location, index) => (
                <button
                  key={location.zone || index}
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
        <div className="w-full max-w-7xl flex justify-between items-start">
          <div className="flex flex-col items-center w-1/3">
            <div className="mb-4 w-full flex justify-center">
              <Calendar
                onChange={(value) => handleDateChange(value as Date | null)}
                value={selectedDate}
                locale="en-US"
                className="border rounded-lg shadow-md w-auto p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {instructors.map((inst) => (
                <div
                  key={inst._id}
                  className={`shadow-lg rounded-lg p-4 text-center cursor-pointer hover:shadow-xl transition-all w-40 
        ${
          selectedInstructor?._id === inst._id
            ? "border-4 border-blue-500 bg-blue-100"
            : "bg-white"
        }`}
                  onClick={() => setSelectedInstructor(inst)}
                >
                  <Image
                    src={inst.photo || "/default-avatar.png"}
                    alt={inst.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full mx-auto mb-2"
                  />
                  <h3 className="text-md font-semibold text-black">
                    {inst.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          <div className="w-2/3">
            {selectedInstructor && (
              <>
                <h2 className="text-2xl font-bold text-center">
                  {selectedInstructor.name}&apos;s Schedule
                </h2>
                {renderScheduleTable()}
              </>
            )}
          </div>
        </div>
      )}
      {renderBookingModal()}
      
    </section>
  );
}
