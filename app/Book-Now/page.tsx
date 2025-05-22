"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/globals.css";
import Modal from "@/components/Modal";
import Image from "next/image";
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

  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const { data: session } = useSession();
  const userId = session?.user?.id || "";

  const [weekOffset, setWeekOffset] = useState(0);

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
    if (!selectedInstructorId) return;
    let isMounted = true;
    let polling: NodeJS.Timeout;
    async function fetchInstructorSchedule() {
      try {
        const res = await fetch(`/api/book-now?id=${selectedInstructorId}`);
        if (!res.ok) throw new Error(`Error fetching schedule: ${res.statusText} (${res.status})`);
        const data = await res.json();
        // Agrupa el schedule plano por fecha
        const groupedSchedule: Schedule[] = Array.isArray(data.schedule)
          ? Object.values(
              data.schedule.reduce((acc, curr) => {
                if (!acc[curr.date]) acc[curr.date] = { date: curr.date, slots: [] };
                acc[curr.date].slots.push({
                  start: curr.start,
                  end: curr.end,
                  status: curr.status,
                  studentId: curr.studentId,
                  _id: curr._id,
                });
                return acc;
              }, {} as Record<string, { date: string; slots: Slot[] }>))
          : [];
        // Busca el instructor base por ID
        const base = instructors.find(i => i._id === selectedInstructorId);
        if (isMounted && base) {
          setSelectedInstructor({ ...base, schedule: groupedSchedule });
        }
      } catch (error) {
        // No log
      }
    }
    fetchInstructorSchedule();
    polling = setInterval(fetchInstructorSchedule, 5000);
    return () => { isMounted = false; clearInterval(polling); };
  }, [selectedInstructorId, instructors]);

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
      const firstAvailableDate = selectedInstructor.schedule[0].date;
      if (!selectedDateStr || !availableDates.includes(selectedDateStr)) {
        // Solo actualiza si la fecha es diferente
        if (!selectedDateStr || selectedDateStr !== firstAvailableDate) {
          setSelectedDate(new Date(firstAvailableDate));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInstructor]);

  const handleSelectLocation = (location: Location) => {
    setInstructors(location.instructors);
    setSelectedInstructor(null);
    setSelectedInstructorId(null);
    setIsModalOpen(false);
  };

  const handleDateChange = (value: Date | Date[] | null) => {
    if (!value || Array.isArray(value)) return;
    setSelectedDate(value);
  };

  const getWeekDates = (date: Date) => {
    const base = new Date(date);
    base.setDate(base.getDate() + weekOffset * 7);
    const startOfWeek = new Date(base);
    startOfWeek.setDate(base.getDate() - startOfWeek.getDay());
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
      const allTimes: string[] = [];
      for (let h = 6; h < 20; h++) {
        allTimes.push(`${h}:00-${h}:30`);
        allTimes.push(`${h}:30-${h+1}:00`);
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
                    <td key={date.toDateString()} className="border border-gray-300 py-1 bg-gray-300 text-black">-</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-gray-400 text-center mt-4">Select a date and instructor to see availability.</p>
        </div>
      );
    }

    const weekDates = getWeekDates(selectedDate);
    // Generar bloques de 30 minutos
    const allTimes: { start: string, end: string }[] = [];
    for (let h = 6; h < 20; h++) {
      allTimes.push({ start: `${pad(h)}:00`, end: `${pad(h)}:30` });
      allTimes.push({ start: `${pad(h)}:30`, end: `${pad(h+1)}:00` });
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
            {allTimes.map((block, index) => (
              <tr key={index} className="text-center">
                <td className="border border-gray-300 p-2 font-bold text-black">{`${block.start}-${block.end}`}</td>
                {weekDates.map((date) => {
                  const dateString = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
                  // Buscar el slot correspondiente
                  const sched = selectedInstructor.schedule?.find(s => s.date === dateString);
                  let slot: Slot | null = null;
                  if (sched && Array.isArray(sched.slots)) {
                    slot = sched.slots.find(s => s.start === block.start && s.end === block.end) ?? null;
                  }
                  // Mostrar solo si es 'free' o 'scheduled' del usuario
                  if (slot) {
                    if (slot.status === 'free') {
                      return (
                        <td key={date.toDateString()} className="border border-gray-300 py-1 bg-green-200 text-black font-bold cursor-pointer hover:bg-green-300"
                          onClick={() => {
                            setSelectedSlot({ start: block.start, end: block.end, date: dateString });
                            setIsBookingModalOpen(true);
                          }}
                        >
                          Free
                        </td>
                      );
                    }
                    if (slot.status === 'scheduled' && slot.studentId && userId && slot.studentId.toString() === userId) {
                      return (
                        <td key={date.toDateString()} className="border border-gray-300 py-1 bg-blue-500 text-white font-bold">
                          Your Booking
                        </td>
                      );
                    }
                    // Si es scheduled pero de otro usuario, mostrar como reservado pero sin nombre
                    if (slot.status === 'scheduled') {
                      return (
                        <td key={date.toDateString()} className="border border-gray-300 py-1 bg-blue-100 text-blue-900">
                          Booked
                        </td>
                      );
                    }
                    // No mostrar cancelados
                  }
                  // Si no hay slot, mostrar '-'
                  return (
                    <td key={date.toDateString()} className="border border-gray-300 py-1 bg-gray-50 text-black">-</td>
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
        <h2 className="text-xl font-bold mb-2">Confirm Appointment</h2>
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
              if (!userId) {
                signIn(); // Redirige al login
                return;
              }
              if (!selectedInstructor?._id || !selectedSlot) return;
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
                setSelectedSlot(null);
                // El polling refrescará el horario automáticamente
              } else {
                alert('Could not book the slot. Please try again.');
              }
            }}
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
                      setSelectedInstructorId(inst._id);
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
                    onClick={() => setWeekOffset(weekOffset - 1)}
                  >
                    ← Previous week
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold shadow"
                    onClick={() => setWeekOffset(weekOffset + 1)}
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
