"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/globals.css";
import Modal from "@/components/Modal";
import Image from "next/image";
import { useAuth } from "@/components/AuthContext";
import LoginModal from "@/components/LoginModal";
import { useScheduleSSE } from "@/hooks/useScheduleSSE";
import { useRouter } from "next/navigation";

interface Slot {
  _id: string;
  start: string;
  end: string;
  status: 'free' | 'scheduled' | 'cancelled' | 'available';
  studentId?: string;
  booked?: boolean;
  classType?: string;
  amount?: number;
  pickupLocation?: string;
  dropoffLocation?: string;
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
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const { user } = useAuth();
  const userId = user?._id || "";

  const [weekOffset, setWeekOffset] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showCancellation, setShowCancellation] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [slotToCancel, setSlotToCancel] = useState<{
    dateString: string;
    slot: Slot;
  } | null>(null);

  // Use SSE hook instead of polling
  const { schedule: sseSchedule, error: sseError, isConnected } = useScheduleSSE(selectedInstructorId);

  // Debug SSE connection
  useEffect(() => {
    // Debug logs (commented out for production)
    // if (sseError) console.log("❌ SSE Error:", sseError);
    // if (isConnected) console.log("✅ SSE Connected successfully");
    // if (selectedInstructorId) console.log("🎯 Selected instructor ID:", selectedInstructorId);
  }, [sseError, isConnected, selectedInstructorId]);

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

  // Process SSE schedule data
  useEffect(() => {
    if (!selectedInstructorId || !sseSchedule) return;
    
    // Filtra solo los slots de tipo "driving test" y agrupa por fecha
    const filteredSchedule = Array.isArray(sseSchedule) 
      ? sseSchedule.filter(slot => slot.classType === "driving test")
      : [];
    
    if (filteredSchedule.length > 0) {
      // console.log("✅ Found driving test slots:", filteredSchedule.length);
    } else {
      // console.log("⚠️ No driving test slots found");
    }
    
    const groupedSchedule: Schedule[] = Object.values(
      filteredSchedule.reduce((acc, curr) => {
        if (!acc[curr.date]) acc[curr.date] = { date: curr.date, slots: [] };
        acc[curr.date].slots.push({
          start: curr.start,
          end: curr.end,
          status: curr.status, // Mantener el status original
          studentId: curr.studentId,
          booked: curr.booked,
          classType: curr.classType,
          _id: curr._id,
          amount: curr.amount,
          pickupLocation: curr.pickupLocation,
          dropoffLocation: curr.dropoffLocation,
        });
        return acc;
      }, {} as Record<string, { date: string; slots: Slot[] }>)
    );
    
    // Busca el instructor base por ID
    const base = instructors.find(i => i._id === selectedInstructorId);
    if (base) {
      setSelectedInstructor({ ...base, schedule: groupedSchedule });
      // console.log("✅ Instructor schedule updated:", groupedSchedule.length, "days with slots");
    }
  }, [sseSchedule, selectedInstructorId, instructors]);

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
    // console.log('Location selected:', location.zone);
    // console.log('Current pathname:', window.location.pathname);
    
    setInstructors(location.instructors);
    setSelectedInstructor(null);
    setSelectedInstructorId(null);
    setIsModalOpen(false);
    
    // Navigate to Book-Now page if not already there
    if (window.location.pathname !== '/Book-Now') {
      // console.log('Navigating to /Book-Now');
      router.push('/Book-Now');
    } else {
      // console.log('Already on Book-Now page');
    }
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
                <th className="border border-gray-300 p-1 text-black min-w-[70px] w-[70px] text-xs">Time</th>
                {weekDates.map((date) => (
                  <th
                    key={date.toDateString()}
                    className="border border-gray-300 p-1 text-black min-w-[80px] w-[80px]"
                  >
                    <span className="block font-bold text-black text-xs">
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span className="block text-black text-xs">
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
                  <td className="border border-gray-300 p-1 font-bold text-black min-w-[70px] w-[70px] text-xs">{time}</td>
                  {weekDates.map((date) => (
                    <td key={date.toDateString()} className="border border-gray-300 py-1 bg-gray-300 text-black min-w-[80px] w-[80px]">-</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-gray-400 text-center mt-4">Select an instructor to see available driving test appointments.</p>
        </div>
      );
    }

    const weekDates = getWeekDates(selectedDate);
    
    // Crear una estructura para rastrear qué slots ya se han mostrado
    const renderedSlots = new Set<string>();
    
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
              <th className="border border-gray-300 p-1 text-black min-w-[70px] w-[70px] text-xs">Time</th>
              {weekDates.map((date) => (
                <th
                  key={date.toDateString()}
                  className="border border-gray-300 p-1 text-black min-w-[80px] w-[80px]"
                >
                  <span className="block font-bold text-black text-xs">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="block text-black text-xs">
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
            {allTimes.map((block, index) => {
              // Para cada fila, necesitamos verificar qué celdas mostrar
              const isRowStart = (dateString: string, slot: Slot) => {
                const toMinutes = (time: string) => {
                  const [hours, minutes] = time.split(':').map(Number);
                  return hours * 60 + minutes;
                };
                const slotStartMin = toMinutes(slot.start);
                const blockStartMin = toMinutes(block.start);
                return slotStartMin === blockStartMin;
              };

              // Pre-calcular si esta fila debe ser renderizada
              const shouldRenderRow = weekDates.some((date) => {
                const dateString = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
                const sched = selectedInstructor.schedule?.find(s => s.date === dateString);
                
                if (!sched || !Array.isArray(sched.slots)) return true; // Mostrar fila vacía
                
                const slot = sched.slots.find(s => {
                  const toMinutes = (time: string) => {
                    const [hours, minutes] = time.split(':').map(Number);
                    return hours * 60 + minutes;
                  };
                  
                  const slotStartMin = toMinutes(s.start);
                  const slotEndMin = toMinutes(s.end);
                  const blockStartMin = toMinutes(block.start);
                  
                  return blockStartMin >= slotStartMin && blockStartMin < slotEndMin;
                });

                // Si hay slot y no es el inicio, esta fila está cubierta por rowSpan
                if (slot && !isRowStart(dateString, slot)) {
                  return false;
                }
                
                return true;
              });

              if (!shouldRenderRow) {
                return null;
              }

              return (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 p-1 font-bold text-black min-w-[70px] w-[70px] text-xs">{`${block.start}-${block.end}`}</td>
                  {weekDates.map((date) => {
                    const dateString = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
                    const sched = selectedInstructor.schedule?.find(s => s.date === dateString);
                    let slot: Slot | null = null;
                    
                    if (sched && Array.isArray(sched.slots)) {
                      slot = sched.slots.find(s => {
                        const toMinutes = (time: string) => {
                          const [hours, minutes] = time.split(':').map(Number);
                          return hours * 60 + minutes;
                        };
                        
                        const slotStartMin = toMinutes(s.start);
                        const slotEndMin = toMinutes(s.end);
                        const blockStartMin = toMinutes(block.start);
                        
                        return blockStartMin >= slotStartMin && blockStartMin < slotEndMin;
                      }) ?? null;
                    }
                    
                    if (slot && isRowStart(dateString, slot)) {
                      // Calcular cuántos bloques abarca este slot
                      const toMinutes = (time: string) => {
                        const [hours, minutes] = time.split(':').map(Number);
                        return hours * 60 + minutes;
                      };
                      
                      const slotStartMin = toMinutes(slot.start);
                      const slotEndMin = toMinutes(slot.end);
                      const slotDurationMin = slotEndMin - slotStartMin;
                      const rowSpan = Math.ceil(slotDurationMin / 30);
                      
                      // Slot disponible para reservar
                      if ((slot.status === 'free' || slot.status === 'available') && !slot.booked) {
                        return (
                          <td key={date.toDateString()} 
                              rowSpan={rowSpan}
                              className="border border-gray-300 py-1 bg-green-200 text-black font-bold cursor-pointer hover:bg-green-300 min-w-[80px] w-[80px]"
                              onClick={() => {
                                if (!userId) {
                                  setShowAuthWarning(true);
                                  return;
                                }
                                setSelectedSlot({ 
                                  start: slot.start, 
                                  end: slot.end, 
                                  date: dateString,
                                  amount: slot.amount,
                                  pickupLocation: slot.pickupLocation,
                                  dropoffLocation: slot.dropoffLocation
                                });
                                setIsBookingModalOpen(true);
                              }}
                          >
                            <div className="text-xs">Available</div>
                            <div className="text-xs">{slot.start}-{slot.end}</div>
                            <div className="text-xs font-bold text-green-700">${slot.amount || 100}</div>
                          </td>
                        );
                      }
                      // Slot reservado por el usuario actual
                      if ((slot.status === 'scheduled' || slot.booked) && slot.studentId && userId && slot.studentId.toString() === userId) {
                        return (
                          <td key={date.toDateString()} 
                              rowSpan={rowSpan}
                              className="border border-gray-300 py-1 bg-blue-500 text-white font-bold cursor-pointer hover:bg-red-500 min-w-[80px] w-[80px]"
                              onClick={() => {
                                setSlotToCancel({ dateString, slot });
                                setShowCancelConfirm(true);
                              }}
                              title="Click to cancel booking"
                          >
                            <div className="text-xs">Your Booking</div>
                            <div className="text-xs">{slot.start}-{slot.end}</div>
                            <div className="text-xs font-bold">${slot.amount || 100}</div>
                          </td>
                        );
                      }
                      // Slot reservado por otro usuario
                      if (slot.status === 'scheduled' || slot.booked) {
                        return (
                          <td key={date.toDateString()} 
                              rowSpan={rowSpan}
                              className="border border-gray-300 py-1 bg-blue-100 text-blue-900 min-w-[80px] w-[80px]">
                            <div className="text-xs">Booked</div>
                            <div className="text-xs">{slot.start}-{slot.end}</div>
                            <div className="text-xs font-bold">${slot.amount || 100}</div>
                          </td>
                        );
                      }
                      // Slot cancelado
                      if (slot.status === 'cancelled') {
                        return (
                          <td key={date.toDateString()} 
                              rowSpan={rowSpan}
                              className="border border-gray-300 py-1 bg-gray-300 text-gray-600 min-w-[80px] w-[80px]">
                            <div className="text-xs">Cancelled</div>
                            <div className="text-xs">{slot.start}-{slot.end}</div>
                            <div className="text-xs font-bold">${slot.amount || 100}</div>
                          </td>
                        );
                      }
                    } else if (slot) {
                      // Este bloque está cubierto por un slot que ya fue renderizado
                      // En lugar de devolver null, esta fila completa ya fue filtrada
                      return <React.Fragment key={date.toDateString()}></React.Fragment>;
                    }
                    
                    // Si no hay slot, mostrar '-'
                    return (
                      <td key={date.toDateString()} className="border border-gray-300 py-1 bg-gray-50 text-black min-w-[80px] w-[80px]">-</td>
                    );
                  })}
                </tr>
              );
            }).filter(row => row !== null)}
          </tbody>
        </table>
      </div>
    );
  };
  

  //Reserva
  // Estado para controlar el modal de reserva y el slot seleccionado
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ 
    start: string, 
    end: string, 
    date: string,
    amount?: number,
    pickupLocation?: string,
    dropoffLocation?: string
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'instructor'>('online');

  // Modal de reserva con confirmación
  const renderBookingModal = () => (
    <Modal
      isOpen={isBookingModalOpen}
      onClose={() => setIsBookingModalOpen(false)}
    >
      <div className="p-6 text-black">
        <h2 className="text-xl font-bold mb-4">Confirm Driving Test Appointment</h2>
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="mb-2">
                <strong>Instructor:</strong> {selectedInstructor?.name}
              </p>
              <p className="mb-2">
                <strong>Date:</strong> {selectedSlot?.date}
              </p>
              <p className="mb-2">
                <strong>Time:</strong> {selectedSlot?.start} - {selectedSlot?.end}
              </p>
              <p className="text-sm text-blue-600">
                <strong>Service:</strong> Driving Test
              </p>
            </div>
            
            <div>
              <p className="mb-2">
                <strong>Amount:</strong> ${selectedSlot?.amount || 100}
              </p>
              <p className="mb-2">
                <strong>Pickup Location:</strong> {selectedSlot?.pickupLocation || "N/A"}
              </p>
              <p className="mb-2">
                <strong>Drop-off Location:</strong> {selectedSlot?.dropoffLocation || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Payment Method:</h3>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'instructor')}
                className="mr-2"
              />
              Pay Online Now
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="instructor"
                checked={paymentMethod === 'instructor'}
                onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'instructor')}
                className="mr-2"
              />
              Pay to Instructor
            </label>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-3">
          <button
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            onClick={() => setIsBookingModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            onClick={async () => {
              if (!userId) {
                setShowAuthWarning(true);
                setIsBookingModalOpen(false);
                return;
              }
              if (!selectedInstructor?._id || !selectedSlot) return;
              if (paymentMethod === 'online') {
                // PAGO ONLINE: Redirigir a la pasarela, NO agendar aún
                try {
                  const res = await fetch('/api/payments/driving-test-redirect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId,
                      instructorId: selectedInstructor._id,
                      date: selectedSlot.date,
                      start: selectedSlot.start,
                      end: selectedSlot.end,
                      classType: 'driving test',
                      amount: selectedSlot.amount || 100,
                      pickupLocation: selectedSlot.pickupLocation || "",
                      dropoffLocation: selectedSlot.dropoffLocation || ""
                    }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setIsBookingModalOpen(false);
                    setSelectedSlot(null);
                    if (data.redirectUrl) {
                      window.location.href = data.redirectUrl;
                    } else {
                      alert('No se pudo obtener la URL de pago. Intenta de nuevo.');
                    }
                  } else {
                    const errorData = await res.json();
                    alert(`No se pudo iniciar el pago: ${errorData.error || 'Intenta de nuevo.'}`);
                  }
                } catch (error) {
                  alert('Error iniciando el pago. Intenta de nuevo.');
                }
                return;
              }
              // PAGO DIRECTO AL INSTRUCTOR: Agendar de inmediato
              try {
                const res = await fetch('/api/booking', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    studentId: userId,
                    instructorId: selectedInstructor._id,
                    date: selectedSlot.date,
                    start: selectedSlot.start,
                    end: selectedSlot.end,
                    classType: 'driving test',
                    amount: selectedSlot.amount || 100,
                    paymentMethod: paymentMethod,
                    pickupLocation: selectedSlot.pickupLocation || "",
                    dropoffLocation: selectedSlot.dropoffLocation || ""
                  }),
                });
                if (res.ok) {
                  setIsBookingModalOpen(false);
                  setSelectedSlot(null);
                  setConfirmationMessage('Driving test appointment booked successfully! Please pay the instructor directly.');
                  setShowConfirmation(true);
                } else {
                  const errorData = await res.json();
                  alert(`Could not book the slot: ${errorData.error || 'Please try again.'}`);
                }
              } catch (error) {
                alert('Error booking appointment. Please try again.');
              }
            }}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </Modal>
  );

  return (
    <section className="bg-white pt-32 pb-8 px-2 sm:px-6 flex flex-col items-center w-full">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Choose a Location for Driving Test
          </h2>
          <div className="flex flex-col space-y-2">
            {locations.length > 0 ? (
              locations.map((location, index) => (
                <button
                  key={location.zone || index}
                  onClick={() => handleSelectLocation(location)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md transition-all font-medium"
                >
                  Book in {location.zone}
                </button>
              ))
            ) : (
              <p className="text-center text-gray-500">Loading locations...</p>
            )}
          </div>
        </div>
      </Modal>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 items-start">
        {/* Calendario y lista de instructores en columna en móvil */}
        <div className="w-full lg:w-1/3 flex flex-col items-center mt-8 sm:mt-12">
          <div className="mb-4 w-full flex justify-center">
            <Calendar
              onChange={(value) => handleDateChange(value as Date | null)}
              value={selectedDate}
              locale="en-US"
              className="border rounded-lg shadow-md w-full max-w-xs p-2"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 w-full">
            {instructors.map((inst) => {
              const [firstName, ...lastNameParts] = inst.name.split(' ');
              const lastName = lastNameParts.join(' ');
              return (
                <div
                  key={inst._id}
                  className={`shadow-lg rounded-xl p-2 sm:p-4 text-center cursor-pointer hover:shadow-xl transition-all w-full ${selectedInstructor?._id === inst._id ? "border-4 border-blue-500 bg-blue-100" : "bg-white"}`}
                  onClick={() => {
                    // console.log("🎯 Instructor selected:", inst._id, inst.name);
                    setSelectedInstructorId(inst._id);
                    setSelectedDate(null);
                  }}
                >
                  <Image
                    src={inst.photo || "/default-avatar.png"}
                    alt={inst.name}
                    width={60}
                    height={60}
                    className="w-14 h-14 sm:w-20 sm:h-20 rounded-full mx-auto mb-1 sm:mb-2"
                  />
                  <div className="flex flex-col items-center mt-1 sm:mt-2">
                    <span className="text-sm sm:text-md font-semibold text-black leading-tight">{firstName}</span>
                    <span className="text-xs sm:text-sm text-gray-600 leading-tight">{lastName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Horario en columna en móvil, tabla scrolleable */}
        <div className="w-full lg:w-2/3 mt-6 lg:mt-0">
          {selectedInstructorId && !selectedInstructor && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading driving test schedule...</p>
              {sseError && <p className="text-red-500 text-sm mt-1">Error: {sseError}</p>}
            </div>
          )}
          
          {selectedInstructor && (
            <>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-4 mt-12">
                <span className="text-blue-700">{selectedInstructor.name}&apos;s </span>
                <span className="text-[#10B981]">Driving Test Schedule</span>
              </h2>
              <p className="text-center text-gray-600 mb-6 text-sm">
                Showing only driving test appointments. Green slots are available for booking.
              </p>
              
              {selectedInstructor.schedule && selectedInstructor.schedule.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No driving test slots available for this instructor.</p>
                  <p className="text-gray-400 text-sm mt-2">Please select another instructor or check back later.</p>
                </div>
              )}
              
              {selectedInstructor.schedule && selectedInstructor.schedule.length > 0 && (
                <>
                  <div className="flex flex-row justify-center items-center mb-8 gap-2 sm:gap-4">
                    <button
                      className="px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 font-semibold shadow transition-all duration-200"
                      onClick={() => setWeekOffset(weekOffset - 1)}
                    >
                      ← Previous week
                    </button>
                    <button
                      className="px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 font-semibold shadow transition-all duration-200"
                      onClick={() => setWeekOffset(weekOffset + 1)}
                    >
                      Next week →
                    </button>
                  </div>
                  <div className="overflow-x-auto w-full">
                    {renderScheduleTable()}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {renderBookingModal()}
      
      {/* Modal de confirmación */}
      <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4 text-green-600">Booking Confirmed!</h2>
            <p className="text-gray-700 mb-4">{confirmationMessage}</p>
          </div>
          <button
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            onClick={() => setShowConfirmation(false)}
          >
            OK
          </button>
        </div>
      </Modal>
      
      {/* Modal de cancelación */}
      <Modal isOpen={showCancellation} onClose={() => setShowCancellation(false)}>
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
              <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4 text-orange-600">Booking Status</h2>
            <p className="text-gray-700 mb-4">{cancellationMessage}</p>
          </div>
          <button
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
            onClick={() => setShowCancellation(false)}
          >
            OK
          </button>
        </div>
      </Modal>
      
      {/* Modal de confirmación de cancelación */}
      <Modal isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)}>
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4 text-red-600">Cancel Booking</h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel this booking?
            </p>
            {slotToCancel && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                <p><strong>Date:</strong> {slotToCancel.dateString}</p>
                <p><strong>Time:</strong> {slotToCancel.slot.start} - {slotToCancel.slot.end}</p>
                <p><strong>Amount:</strong> ${slotToCancel.slot.amount || 100}</p>
              </div>
            )}
            <p className="text-sm text-gray-500">The slot will become available for other students.</p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              onClick={() => {
                setShowCancelConfirm(false);
                setSlotToCancel(null);
              }}
            >
              Keep Booking
            </button>
            <button
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
              onClick={async () => {
                if (slotToCancel && selectedInstructor) {
                  try {
                    const res = await fetch('/api/booking/cancel', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        studentId: userId,
                        instructorId: selectedInstructor._id,
                        date: slotToCancel.dateString,
                        start: slotToCancel.slot.start,
                        end: slotToCancel.slot.end,
                      }),
                    });
                    
                    setShowCancelConfirm(false);
                    setSlotToCancel(null);
                    
                    if (res.ok) {
                      setCancellationMessage('Booking cancelled successfully. The slot is now available again.');
                      setShowCancellation(true);
                    } else {
                      setCancellationMessage('Could not cancel the booking. Please try again.');
                      setShowCancellation(true);
                    }
                  } catch (error) {
                    setCancellationMessage('Error cancelling booking. Please try again.');
                    setShowCancellation(true);
                  }
                }
              }}
            >
              Yes, Cancel Booking
            </button>
          </div>
        </div>
      </Modal>
      
      <Modal isOpen={showAuthWarning} onClose={() => setShowAuthWarning(false)}>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Authentication Required</h2>
          <p className="mb-4">You must be logged in to book a class. Please sign in first.</p>
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded"
            onClick={() => setShowAuthWarning(false)}
          >
            Close
          </button>
        </div>
      </Modal>
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => setShowLogin(false)}
      />
    </section>
  );
}
