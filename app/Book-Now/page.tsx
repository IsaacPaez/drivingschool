"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/globals.css";
import Modal from "@/components/Modal";
import Image from "next/image";
import useDrivingLessons from "@/app/hooks/useDrivingLessons";
import { useSession, signIn } from "next-auth/react";

interface Slot {
  _id: string;
  start: string;
  end: string;
  status: 'free' | 'scheduled' | 'cancelled';
  studentId?: string;
}

interface Instructor {
  _id: string;
  name: string;
  photo?: string;
  schedule?: Schedule[];
}

interface Schedule {
  date: string;
  slots: Slot[];
}

interface Location {
  title: string;
  zone: string;
  instructors: Instructor[];
}

export default function BookNowPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const lessons = useDrivingLessons("Road Skills for Life");

  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const { data: session } = useSession();
  const userId = session?.user?.id || "";

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

  useEffect(() => {
    if (!selectedInstructor) return;
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

  useEffect(() => {
    if (
      selectedInstructor &&
      selectedInstructor.schedule &&
      selectedInstructor.schedule.length > 0
    ) {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const availableDates = selectedInstructor.schedule.map(s => s.date);
      const selectedDateStr = selectedDate
        ? `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`
        : null;
      if (!selectedDateStr || !availableDates.includes(selectedDateStr)) {
        setSelectedDate(new Date(selectedInstructor.schedule[0].date));
      }
    }
  }, [selectedInstructor, selectedDate]);

  const handleSelectLocation = (location: Location) => {
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
    startOfWeek.setDate(date.getDate() - startOfWeek.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const pad = (n: number) => n.toString().padStart(2, '0');
  const renderScheduleTable = () => {
    if (!selectedInstructor || !selectedDate) {
      // Mostrar tabla vacía con mensaje
      const weekDates = getWeekDates(selectedDate || new Date());
      const allTimes = [];
      for (let h = 6; h < 19; h++) {
        allTimes.push(`${h}:00-${h+1}:00`);
      }
      return (
        <div className="overflow-x-auto w-full mt-6">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="border border-gray-300 p-2 text-black">Time</th>
                {weekDates.map((date) => (
                  <th
                    key={date.toDateString()}
                    className="border border-gray-300 p-2 text-black"
                  >
                    <span className="block font-bold text-black">
                      {date.toLocaleDateString("en-US", { weekday: "long" })}
                    </span>
                    <span className="block text-black">
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
              {allTimes.map((time, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 p-2 font-bold text-black">{time}</td>
                  {weekDates.map((date) => (
                    <td key={date.toDateString()} className="border border-gray-300 p-4 bg-gray-300 text-black">-</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-gray-400 text-center mt-4">Select a date and instructor to see availability.</p>
        </div>
      );
    }
  
    // Adaptar la lógica de TeachersCalendar: expandir slots a bloques horarios individuales
    const weekDates = getWeekDates(selectedDate);
    // Mapa: { '2025-05-09': { 6: true, 7: true, ... } }
    const freeBlocksByDate: Record<string, Record<number, boolean>> = {};
    for (const sched of selectedInstructor?.schedule || []) {
      // Normaliza la fecha a YYYY-MM-DD
      let date = sched.date;
      if (date.length !== 10) {
        const d = new Date(date);
        date = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
      }
      if (!freeBlocksByDate[date]) freeBlocksByDate[date] = {};
      for (const slot of sched.slots) {
        if (slot.status === 'free') {
          const startHour = parseInt(slot.start.split(":")[0], 10);
          const endHour = parseInt(slot.end.split(":")[0], 10);
          for (let h = startHour; h < endHour; h++) {
            freeBlocksByDate[date][h] = true;
          }
        }
      }
    }
    const allTimes = [];
    for (let h = 6; h < 19; h++) {
      allTimes.push(h);
    }
    return (
      <div className="overflow-x-auto w-full mt-6">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border border-gray-300 p-2 text-black">Time</th>
              {weekDates.map((date) => (
                <th
                  key={date.toDateString()}
                  className="border border-gray-300 p-2 text-black"
                >
                  <span className="block font-bold text-black">
                    {date.toLocaleDateString("en-US", { weekday: "long" })}
                  </span>
                  <span className="block text-black">
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
            {allTimes.map((h, index) => (
              <tr key={index} className="text-center">
                <td className="border border-gray-300 p-2 font-bold text-black">{`${h}:00-${h+1}:00`}</td>
                {weekDates.map((date) => {
                  const dateString = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
                  const isFree = freeBlocksByDate[dateString]?.[h];
                  // Buscar el slot real para saber si está reservado por el usuario
                  let slot: Slot | null = null;
                  if (selectedInstructor?.schedule) {
                    slot = selectedInstructor.schedule.find((s) => s.date === dateString)?.slots.find(s => 
                      parseInt(s.start.split(":")[0], 10) === h
                    ) || null;
                  }
                  const isMine = slot && slot.status === 'scheduled' && slot.studentId && userId && slot.studentId.toString() === userId;
                  return (
                    <td
                      key={date.toDateString()}
                      className={`border border-gray-300 p-4
                        ${isMine ? "bg-blue-500 text-white font-bold" : ""}
                        ${slot && slot.status === 'scheduled' && !isMine ? "bg-blue-100 text-blue-900" : ""}
                        ${isFree ? "bg-green-200 text-black font-bold cursor-pointer hover:bg-green-300" : ""}
                        ${!isFree && (!slot || slot.status !== 'scheduled') ? "bg-gray-50 text-black" : ""}
                      `}
                      onClick={() => {
                        if (isFree) {
                          if (!session || !session.user) {
                            signIn("auth0", { callbackUrl: "/Book-Now" });
                            return;
                          }
                          if (userId) {
                            const pad = (n: number) => n.toString().padStart(2, '0');
                            setSelectedSlot({
                              start: `${pad(h)}:00`,
                              end: `${pad(h+1)}:00`,
                              date: dateString,
                            });
                            setIsBookingModalOpen(true);
                          }
                        }
                      }}
                    >
                      {isMine
                        ? <span><span role="img" aria-label="check">✅</span> Your Booking</span>
                        : slot && slot.status === 'scheduled'
                        ? <span><span role="img" aria-label="calendar">📘</span> Scheduled</span>
                        : isFree
                        ? <span><span role="img" aria-label="clock">⏰</span> Free</span>
                        : "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  

  //Reserva
  // Estado para controlar el modal de reserva y el slot seleccionado
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string, end: string, date: string } | null>(null);

  // Modal de reserva con confirmación
  const renderBookingModal = () => (
    <Modal
      isOpen={isBookingModalOpen}
      onClose={() => setIsBookingModalOpen(false)}
    >
      <div className="p-6 text-black">
        <h2 className="text-xl font-bold mb-2">Confirm Reservation</h2>
        <p>
          <strong>Instructor:</strong> {selectedInstructor?.name}
        </p>
        <p>
          <strong>Date:</strong> {selectedSlot?.date}
        </p>
        <p>
          <strong>Time:</strong> {selectedSlot?.start} - {selectedSlot?.end}
        </p>
        <div className="mt-4 flex justify-center">
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded"
            onClick={async () => {
              if (!userId || !selectedInstructor?._id || !selectedSlot) return;
              const res = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  studentId: userId,
                  instructorId: selectedInstructor._id,
                  date: selectedSlot.date,
                  start: selectedSlot.start,
                  end: selectedSlot.end,
                }),
              });
              if (res.ok) {
                setIsBookingModalOpen(false);
                // Recarga el horario del instructor
                setSelectedInstructor(null);
                setTimeout(() => setSelectedInstructor(selectedInstructor), 0);
              } else {
                alert('Could not book the slot. Please try again.');
              }
            }}
          >
            Confirm Reservation
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
              {instructors.map((inst) => {
                // Divide el nombre completo en nombre y apellido
                const [firstName, ...lastNameParts] = inst.name.split(' ');
                const lastName = lastNameParts.join(' ');
                return (
                  <div
                    key={inst._id}
                    className={`shadow-lg rounded-lg p-4 text-center cursor-pointer hover:shadow-xl transition-all w-40 
        ${
          selectedInstructor?._id === inst._id
            ? "border-4 border-blue-500 bg-blue-100"
            : "bg-white"
        }`}
                    onClick={() => {
                      setSelectedInstructor(inst);
                      setSelectedDate(null);
                    }}
                  >
                    <Image
                      src={inst.photo || "/default-avatar.png"}
                      alt={inst.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full mx-auto mb-2"
                    />
                    <div className="flex flex-col items-center mt-2">
                      <span className="text-md font-semibold text-black leading-tight">{firstName}</span>
                      <span className="text-sm text-gray-600 leading-tight">{lastName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-2/3">
            {selectedInstructor && (
              <>
                <h2 className="text-2xl font-bold text-center text-blue-700">
                  {selectedInstructor.name}&apos;s Schedule
                </h2>
                <div className="flex justify-center items-center mb-2 gap-4">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold shadow"
                    onClick={() => {
                      const base = selectedDate || new Date();
                      const prev = new Date(base);
                      prev.setDate(base.getDate() - 7);
                      setSelectedDate(prev);
                    }}
                  >
                    ← Previous week
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold shadow"
                    onClick={() => {
                      const base = selectedDate || new Date();
                      const next = new Date(base);
                      next.setDate(base.getDate() + 7);
                      setSelectedDate(next);
                    }}
                  >
                    Next week →
                  </button>
                </div>
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
