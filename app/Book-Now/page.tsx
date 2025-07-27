"use client";

import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/globals.css";
import Modal from "@/components/Modal";
import BookingModal from "@/components/BookingModal";
import Image from "next/image";
import { useAuth } from "@/components/AuthContext";
import LoginModal from "@/components/LoginModal";
import { useScheduleSSE } from "@/hooks/useScheduleSSE";
import { useRouter } from "next/navigation";

// Google Maps configuration - removed as not needed for driving test

interface Slot {
  _id: string;
  start: string;
  end: string;
  status: 'free' | 'scheduled' | 'cancelled' | 'available' | 'pending' | 'booked';
  studentId?: string;
  booked?: boolean;
  classType?: string;
  amount?: number;
  pickupLocation?: string;
  dropoffLocation?: string;
}

interface SlotWithDate extends Slot {
  date: string;
}

interface Instructor {
  _id: string;
  name: string;
  photo?: string;
  schedule?: Schedule[];
}

interface InstructorWithSchedule extends Instructor {
  schedule: Schedule[];
}

interface Schedule {
  date: string;
  slots: Slot[];
}

interface Location {
  _id?: string;
  title: string;
  zone: string;
  instructors: Instructor[];
}

interface AvailableClass {
  instructorId: string;
  instructorName: string;
  instructorPhoto: string;
  date: string;
  start: string;
  end: string;
  status: string;
  classType: string;
  slotId: string;
  amount?: number;
  pickupLocation?: string;
  dropoffLocation?: string;
}

export default function BookNowPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorWithSchedule | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([]); // Used for API data management
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingClasses, setIsLoadingClasses] = useState(false); // Used in location selection flow
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

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
  const [initialLoading, setInitialLoading] = useState(true);

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
      } finally {
        setInitialLoading(false);
      }
    }
    fetchLocations();
  }, []);

  // Process SSE schedule data
  useEffect(() => {
    if (!selectedInstructorId) {
      setIsLoadingSchedule(false);
      return;
    }

    if (!sseSchedule) {
      setIsLoadingSchedule(true);
      return;
    }
    
    // console.log('🔍 Processing SSE schedule data:', {
    //   selectedInstructorId,
    //   sseScheduleLength: Array.isArray(sseSchedule) ? sseSchedule.length : 'not array',
    //   sseSchedule: sseSchedule
    // });
    
    // Los datos de schedule_driving_test ya son de tipo "driving test", no necesitamos filtrar
    const scheduleSlots = Array.isArray(sseSchedule) ? sseSchedule as SlotWithDate[] : [];
    
    // console.log('📋 Schedule slots to display:', scheduleSlots.length, scheduleSlots);
    
    const groupedSchedule: Schedule[] = Object.values(
      scheduleSlots.reduce((acc, curr) => {
        if (!acc[curr.date]) acc[curr.date] = { date: curr.date, slots: [] };
        acc[curr.date].slots.push({
          start: curr.start,
          end: curr.end,
          status: curr.status, // Mantener el status original
          studentId: curr.studentId,
          booked: curr.booked,
          classType: curr.classType || "driving test",
          _id: curr._id,
          amount: curr.amount,
          pickupLocation: curr.pickupLocation,
          dropoffLocation: curr.dropoffLocation,
        });
        return acc;
      }, {} as Record<string, { date: string; slots: Slot[] }>)
    );
    
    // console.log('📅 Grouped schedule:', groupedSchedule);
    
    // Busca el instructor base por ID
    const base = instructors.find(i => i._id === selectedInstructorId);
    // console.log('👨‍🏫 Found instructor base:', base?.name, 'with ID:', base?._id);
    
    if (base) {
      setSelectedInstructor({ ...base, schedule: groupedSchedule });
      setIsLoadingSchedule(false);
      // console.log("✅ Instructor schedule updated:", groupedSchedule.length, "days with slots");
    } else {
      // console.log("❌ No instructor base found for ID:", selectedInstructorId);
      setIsLoadingSchedule(false);
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

  // Función para actualizar clases disponibles cuando cambie la semana
  const updateAvailableClasses = useCallback(async () => {
    if (selectedLocation?._id) {
      setIsLoadingClasses(true);
      try {
        const response = await fetch(`/api/driving-test/available-classes?locationId=${selectedLocation._id}&weekOffset=${weekOffset}`);
        const data = await response.json();
        
        if (data.success) {
          // console.log('🔄 Updated available classes:', data.availableClasses.length);
          setAvailableClasses(data.availableClasses);
        } else {
          // console.error('❌ Error updating available classes:', data.error);
          setAvailableClasses([]);
        }
      } catch (error) {
        // console.error('❌ Failed to update available classes:', error);
        setAvailableClasses([]);
      }
      setIsLoadingClasses(false);
    }
  }, [selectedLocation, weekOffset]);

  // useEffect para actualizar clases cuando cambie weekOffset
  useEffect(() => {
    updateAvailableClasses();
  }, [updateAvailableClasses]);

  const handleSelectLocation = async (location: Location) => {
    // console.log('🏢 Location selected:', location.zone, 'ID:', location._id);
    
    setIsLoadingClasses(true);
    setSelectedLocation(location);
    setInstructors(location.instructors);
    setSelectedInstructor(null);
    setSelectedInstructorId(null);
    setIsLoadingSchedule(false);
    setIsModalOpen(false);
    
    // Obtener clases disponibles para esta ubicación  
    if (location._id) {
      try {
        const response = await fetch(`/api/driving-test/available-classes?locationId=${location._id}&weekOffset=${weekOffset}`);
        const data = await response.json();
        
        if (data.success) {
          // console.log('✅ Available classes loaded:', data.availableClasses.length);
          setAvailableClasses(data.availableClasses);
          setInstructors(data.instructors);
          
          // Seleccionar automáticamente el primer instructor
          if (data.instructors && data.instructors.length > 0) {
            const firstInstructor = data.instructors[0];
            // console.log('🎯 Auto-selecting first instructor:', firstInstructor.name);
            setIsLoadingSchedule(true);
            setSelectedInstructorId(firstInstructor._id);
            setSelectedInstructor(null);
            setSelectedDate(null);
          }
        } else {
          // console.error('❌ Error loading available classes:', data.error);
          setAvailableClasses([]);
        }
      } catch (error) {
        // console.error('❌ Failed to fetch available classes:', error);
        setAvailableClasses([]);
      }
    }
    
    setIsLoadingClasses(false);
    
    // Navigate to Book-Now page if not already there
    if (window.location.pathname !== '/Book-Now') {
      router.push('/Book-Now');
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

    if (!selectedInstructor || !selectedInstructor.schedule) {
      if (isLoadingSchedule && selectedInstructorId) {
        // Show skeleton table while loading
        return (
          <div className="overflow-x-auto w-full mt-6">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className="border border-gray-300 p-1 text-black min-w-[70px] w-[70px] text-xs">Time</th>
                  {getWeekDates(selectedDate || new Date()).map((date) => {
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    return (
                      <th
                        key={date.toDateString()}
                        className="border border-gray-300 p-1 text-black min-w-[80px] w-[80px]"
                      >
                        <span className="block font-bold text-black text-xs">
                          {dayNames[date.getDay()]}
                        </span>
                        <span className="block text-black text-xs">
                          Jul {date.getDate()}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 28 }, (_, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 p-1 text-center text-xs bg-gray-50">
                      {Math.floor(i/2) + 6}:{i % 2 === 0 ? '00' : '30'}
                    </td>
                    {Array.from({ length: 7 }, (_, j) => (
                      <td key={j} className="border border-gray-300 p-1">
                        <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      
      return (
        <div className="text-center mt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">No driving test slots available for this instructor.</p>
            <p className="text-yellow-600 text-sm mt-1">Please select another instructor or check back later.</p>
          </div>
        </div>
      );
    }

    const weekDates = getWeekDates(selectedDate || new Date());
    
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
              {weekDates.map((date) => {
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return (
                  <th
                    key={date.toDateString()}
                    className="border border-gray-300 p-1 text-black min-w-[80px] w-[80px]"
                  >
                    <span className="block font-bold text-black text-xs">
                      {dayNames[date.getDay()]}
                    </span>
                    <span className="block text-black text-xs">
                      Jul {date.getDate()}
                    </span>
                  </th>
                );
              })}
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

              // SIEMPRE renderizar todas las filas para evitar espacios vacíos
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
                    
                    // Filter out slots that should be hidden (cancelled, other students' bookings)
                    if (slot && (
                      slot.status === 'cancelled' || 
                      (slot.studentId && 
                       (slot.status === 'booked' || slot.status === 'scheduled' || slot.status === 'pending' || slot.booked) &&
                       (!userId || slot.studentId.toString() !== userId))
                    )) {
                      slot = null; // Treat as if there's no slot, so it shows "-"
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
                                  instructorName: selectedInstructor?.name,
                                  instructorId: selectedInstructor?._id
                                });
                                setIsBookingModalOpen(true);
                              }}
                          >
                            <div className="text-xs">Available</div>
                            <div className="text-xs font-bold text-green-700">${slot.amount || 50}</div>
                          </td>
                        );
                      }
                      // Slot pendiente del usuario actual
                      if (slot.status === 'pending' && slot.studentId && userId && slot.studentId.toString() === userId) {
                        return (
                          <td key={date.toDateString()} 
                              rowSpan={rowSpan}
                              className="border border-gray-300 py-1 bg-orange-200 text-orange-800 font-bold cursor-pointer hover:bg-red-300 min-w-[80px] w-[80px]"
                              onClick={() => {
                                setSlotToCancel({ dateString, slot });
                                setShowCancelConfirm(true);
                              }}
                              title="Click to cancel pending request"
                          >
                            <div className="text-xs">Your Pending</div>
                            <div className="text-xs font-bold">${slot.amount || 50}</div>
                          </td>
                        );
                      }
                      // Slot reservado/booked del usuario actual
                      if ((slot.status === 'scheduled' || slot.status === 'booked' || slot.booked) && slot.studentId && userId && slot.studentId.toString() === userId) {
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
                            <div className="text-xs font-bold">${slot.amount || 50}</div>
                          </td>
                        );
                      }
                      // REMOVED: Slots from other students and cancelled slots - they are filtered out above
                      // If we reach here and there's a slot but none of the above conditions match,
                      // treat it as empty and show "-"
                      // This handles slots that exist but don't match any booking conditions
                      return (
                        <td key={date.toDateString()} className="border border-gray-300 py-1 bg-gray-50 text-black min-w-[80px] w-[80px]">-</td>
                      );
                    } else if (slot) {
                      // Este bloque está cubierto por un slot que ya fue renderizado
                      return <React.Fragment key={date.toDateString()}></React.Fragment>;
                    }
                    
                    // SIEMPRE mostrar algo - si no hay slot, mostrar '-'
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
  

  // Estado para controlar el modal de reserva y el slot seleccionado
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ 
    start: string, 
    end: string, 
    date: string,
    amount?: number,
    instructorName?: string,
    instructorId?: string
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'instructor'>('online');
  // Nuevo: Estado para loading de pago online
  const [isOnlinePaymentLoading, setIsOnlinePaymentLoading] = useState(false);
  
  // Estados para el flujo de pago local
  const [showContactModal, setShowContactModal] = useState(false);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);

  // Modal de reserva con confirmación
  const renderBookingModal = () => {
    const handleConfirm = async () => {
      if (!userId) {
        setShowAuthWarning(true);
        setIsBookingModalOpen(false);
        return;
      }
      if (!selectedSlot?.instructorId || !selectedSlot) return;
      
      if (paymentMethod === 'online') {
        // PAGO ONLINE: Agregar al carrito y poner slot en pending
        setIsOnlinePaymentLoading(true);
        try {
          const res = await fetch('/api/cart/add-driving-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              instructorId: selectedSlot.instructorId,
              date: selectedSlot.date,
              start: selectedSlot.start,
              end: selectedSlot.end,
              classType: 'driving test',
              amount: selectedSlot.amount || 50
            }),
          });
          
          if (res.ok) {
            setIsBookingModalOpen(false);
            setSelectedSlot(null);
            setIsOnlinePaymentLoading(false);
            setConfirmationMessage('Driving test added to cart successfully! The slot is reserved as pending. Please complete your payment in the cart.');
            setShowConfirmation(true);
          } else {
            setIsOnlinePaymentLoading(false);
            const errorData = await res.json();
            alert(`Could not add to cart: ${errorData.error || 'Please try again.'}`);
          }
        } catch {
          setIsOnlinePaymentLoading(false);
          alert('Error adding to cart. Please try again.');
        }
        return;
      }
      
      // PAGO LOCAL: Reservar slot como pending y mostrar modal de contacto
      setIsProcessingBooking(true);
      try {
        const res = await fetch('/api/booking/reserve-pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: userId,
            instructorId: selectedSlot.instructorId,
            date: selectedSlot.date,
            start: selectedSlot.start,
            end: selectedSlot.end,
            classType: 'driving test',
            amount: selectedSlot.amount || 50,
            paymentMethod: 'instructor'
          }),
        });
        
        if (res.ok) {
          setIsBookingModalOpen(false);
          setSelectedSlot(null);
          setIsProcessingBooking(false);
          setShowContactModal(true);
        } else {
          setIsProcessingBooking(false);
          const errorData = await res.json();
          alert(`Could not reserve the slot: ${errorData.error || 'Please try again.'}`);
        }
      } catch {
        setIsProcessingBooking(false);
        alert('Error reserving appointment. Please try again.');
      }
    };

    return (
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedSlot={selectedSlot}
        selectedInstructor={selectedInstructor}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        isOnlinePaymentLoading={isOnlinePaymentLoading}
        isProcessingBooking={isProcessingBooking}
        onConfirm={handleConfirm}
      />
    );
  };

  // Loading inicial de pantalla completa
  if (initialLoading) {
    return (
      <section className="bg-white min-h-screen flex flex-col items-center justify-center w-full">
        <div className="text-center p-12 max-w-lg mx-auto">
          <div className="inline-block animate-spin rounded-full h-20 w-20 border-4 border-gray-100 border-t-[#10B981] mb-8 shadow-lg"></div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Loading Book Now</h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Please wait while we load all instructors and schedules...
          </p>
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-[#10B981] rounded-full animate-bounce shadow-md"></div>
              <div className="w-3 h-3 bg-[#10B981] rounded-full animate-bounce shadow-md" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-[#10B981] rounded-full animate-bounce shadow-md" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white pt-32 pb-8 px-2 sm:px-6 flex flex-col items-center w-full">
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        router.push('/driving_test');
      }}>
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

      {/* Initial Layout - Calendar and Instructors */}
      {!selectedInstructorId && selectedLocation && (
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 items-start">
          {/* Calendar and instructors column */}
          <div className="w-full lg:w-1/3 flex flex-col items-center mt-8 sm:mt-12">
            {/* Calendar Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 text-[#10B981]">
              Select Date
            </h2>
            
            {/* Calendar */}
            <div className="mb-4 w-full flex justify-center">
              <Calendar
                onChange={(value) => handleDateChange(value as Date | null)}
                value={selectedDate}
                locale="en-US"
                className="border rounded-lg shadow-md w-full max-w-xs p-2"
                minDate={new Date()}
                onClickDay={(date) => {
                  // ALWAYS change week when clicking on calendar
                  console.log('📅 Calendar click on:', date.toDateString());
                  
                  // Calculate the start of the week for the clicked date (Sunday = 0)
                  const targetWeekStart = new Date(date);
                  targetWeekStart.setDate(date.getDate() - date.getDay());
                  targetWeekStart.setHours(0, 0, 0, 0);
                  
                  // Calculate the start of TODAY's week for reference
                  const today = new Date();
                  const currentWeekStart = new Date(today);
                  currentWeekStart.setDate(today.getDate() - today.getDay());
                  currentWeekStart.setHours(0, 0, 0, 0);
                  
                  // Calculate the week difference from current week
                  const weekDiff = Math.round((targetWeekStart.getTime() - currentWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
                  
                  console.log('📅 Week calculation:', {
                    clickedDate: date.toDateString(),
                    targetWeekStart: targetWeekStart.toDateString(),
                    currentWeekStart: currentWeekStart.toDateString(),
                    calculatedWeekDiff: weekDiff,
                    previousOffset: weekOffset,
                    willUpdate: true
                  });
                  
                  // ALWAYS update the week offset - force update
                  setWeekOffset(weekDiff);
                  console.log('📅 Updated weekOffset to:', weekDiff);
                }}
              />
            </div>
            
            {/* Available Instructors Title */}
            <h3 className="text-lg sm:text-xl font-semibold text-center mb-4 text-gray-700">
              Available Instructors
            </h3>
            
            {/* Instructors Grid - Max 2 per row */}
            <div className="grid grid-cols-2 gap-3 mt-2 w-full">
              {instructors.map((inst) => {
                const [firstName, ...lastNameParts] = inst.name.split(' ');
                const lastName = lastNameParts.join(' ');
                const isSelected = selectedInstructor?._id === inst._id;
                const isLoadingThis = isLoadingSchedule && selectedInstructorId === inst._id;
                return (
                  <div
                    key={inst._id}
                    className={`shadow-lg rounded-xl p-2 sm:p-4 text-center cursor-pointer hover:shadow-xl transition-all w-full relative ${
                      isSelected 
                        ? "border-4 border-blue-500 bg-blue-100" 
                        : "bg-white"
                    }`}
                    onClick={() => {
                      setIsLoadingSchedule(true);
                      setSelectedInstructorId(inst._id);
                    }}
                  >
                    {isLoadingThis && (
                      <div className="absolute inset-0 bg-blue-100 bg-opacity-90 rounded-xl flex items-center justify-center z-10">
                        <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                      </div>
                    )}
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
          
          {/* Message to select instructor */}
          <div className="w-full lg:w-2/3 mt-6 lg:mt-0 flex items-center justify-center">
            <div className="text-center py-16">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
                <span className="text-[#10B981]">Select an Instructor</span>
              </h2>
              <p className="text-gray-600 text-lg">
                Please select an instructor to view their available driving test appointments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule View - Show when instructor is selected */}
      {selectedInstructorId && (
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 items-start">
          {/* Calendar and instructors column */}
          <div className="w-full lg:w-1/3 flex flex-col items-center mt-8 sm:mt-12">
            {/* Calendar Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 text-[#10B981]">
              Select Date
            </h2>
            
            {/* Calendar */}
            <div className="mb-4 w-full flex justify-center">
              <Calendar
                onChange={(value) => handleDateChange(value as Date | null)}
                value={selectedDate}
                locale="en-US"
                className="border rounded-lg shadow-md w-full max-w-xs p-2"
                minDate={new Date()}
                onClickDay={(date) => {
                  // ALWAYS change week when clicking on calendar
                  console.log('📅 Calendar click on:', date.toDateString());
                  
                  // Calculate the start of the week for the clicked date (Sunday = 0)
                  const targetWeekStart = new Date(date);
                  targetWeekStart.setDate(date.getDate() - date.getDay());
                  targetWeekStart.setHours(0, 0, 0, 0);
                  
                  // Calculate the start of TODAY's week for reference
                  const today = new Date();
                  const currentWeekStart = new Date(today);
                  currentWeekStart.setDate(today.getDate() - today.getDay());
                  currentWeekStart.setHours(0, 0, 0, 0);
                  
                  // Calculate the week difference from current week
                  const weekDiff = Math.round((targetWeekStart.getTime() - currentWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
                  
                  console.log('📅 Week calculation:', {
                    clickedDate: date.toDateString(),
                    targetWeekStart: targetWeekStart.toDateString(),
                    currentWeekStart: currentWeekStart.toDateString(),
                    calculatedWeekDiff: weekDiff,
                    previousOffset: weekOffset,
                    willUpdate: true
                  });
                  
                  // ALWAYS update the week offset - force update
                  setWeekOffset(weekDiff);
                  console.log('📅 Updated weekOffset to:', weekDiff);
                }}
              />
            </div>
            
            {/* Available Instructors Title */}
            <h3 className="text-lg sm:text-xl font-semibold text-center mb-4 text-gray-700">
              Available Instructors
            </h3>
            
            {/* Instructors Grid - Max 2 per row */}
            <div className="grid grid-cols-2 gap-3 mt-2 w-full">
              {instructors.map((inst) => {
                const [firstName, ...lastNameParts] = inst.name.split(' ');
                const lastName = lastNameParts.join(' ');
                const isSelected = selectedInstructor?._id === inst._id;
                const isLoadingThis = isLoadingSchedule && selectedInstructorId === inst._id;
                return (
                  <div
                    key={inst._id}
                    className={`shadow-lg rounded-xl p-2 sm:p-4 text-center cursor-pointer hover:shadow-xl transition-all w-full relative ${
                      isSelected 
                        ? "border-4 border-blue-500 bg-blue-100" 
                        : "bg-white"
                    }`}
                    onClick={() => {
                      setIsLoadingSchedule(true);
                      setSelectedInstructorId(inst._id);
                    }}
                  >
                    {isLoadingThis && (
                      <div className="absolute inset-0 bg-blue-100 bg-opacity-90 rounded-xl flex items-center justify-center z-10">
                        <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                      </div>
                    )}
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
          
          {/* Schedule table column */}
          <div className="w-full lg:w-2/3 mt-6 lg:mt-0">

            {selectedInstructorId && (
              <>
                {/* Schedule Title - Moved to the right */}
                <div className="flex justify-center">
                  <div className="ml-16">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-4 mt-12">
                      <span className="text-blue-700">
                        {selectedInstructor ? selectedInstructor.name : 'Loading...'}&apos;s 
                      </span>
                      <span className="text-[#10B981]">Driving Test Schedule</span>
                    </h2>
                    <p className="text-center text-gray-600 mb-6 text-sm">
                      Showing only driving test appointments. Green slots are available for booking.
                    </p>
                  </div>
                </div>
                
                {/* Week Navigation Buttons */}
                <div className="flex justify-center">
                  <div className="ml-16">
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
                  </div>
                </div>
                
                {/* Schedule Table */}
                <div className="overflow-x-auto w-full -mt-4 relative">
                  {renderScheduleTable()}
                  {isLoadingSchedule && selectedInstructorId && (
                    <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-blue-600 text-sm font-medium">Updating schedule...</span>
                      </div>
                    </div>
                  )}
                  {sseError && (
                    <div className="absolute top-2 right-2 bg-red-100 border border-red-300 rounded px-3 py-1 z-20">
                      <p className="text-red-600 text-xs">Connection error</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {renderBookingModal()}
      
      {/* Modal de contacto para pago local */}
      <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)}>
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">Slot Reserved Successfully!</h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4 text-left">
              <p className="text-sm text-gray-600 mb-2">Your driving test appointment has been reserved:</p>
              <p><strong>Status:</strong> <span className="text-orange-600">Pending Payment</span></p>
              <p><strong>Next Step:</strong> Contact us to complete your payment</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">📞 Contact Information</h3>
              <p className="text-yellow-700 text-lg font-bold">Call us at: (561) 330-7007</p>
              <p className="text-yellow-600 text-sm mt-2">
                Please call to complete your payment and confirm your driving test appointment.
              </p>
            </div>
            <p className="text-gray-600 text-sm">
              Your slot will be held temporarily. Please contact us within 24 hours to complete the payment, 
              or the slot may become available to other students.
            </p>
          </div>
          <button
            className="bg-green-500 text-white px-8 py-3 rounded hover:bg-green-600 font-semibold"
            onClick={() => setShowContactModal(false)}
          >
            Got it!
          </button>
        </div>
      </Modal>
      
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
                    // console.log('🔥 Attempting to cancel slot:', {
                    //   studentId: userId,
                    //   instructorId: selectedInstructor._id,
                    //   date: slotToCancel.dateString,
                    //   start: slotToCancel.slot.start,
                    //   end: slotToCancel.slot.end,
                    //   slotId: slotToCancel.slot._id
                    // });
                    
                    const res = await fetch('/api/booking/cancel', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        studentId: userId,
                        instructorId: selectedInstructor._id,
                        date: slotToCancel.dateString,
                        start: slotToCancel.slot.start,
                        end: slotToCancel.slot.end,
                        slotId: slotToCancel.slot._id,
                        classType: 'driving test'
                      }),
                    });
                    
                    setShowCancelConfirm(false);
                    setSlotToCancel(null);
                    
                    if (res.ok) {
                      const responseData = await res.json();
                      // console.log('✅ Cancellation successful:', responseData);
                      setCancellationMessage('Booking cancelled successfully. The slot is now available again.');
                      setShowCancellation(true);
                    } else {
                      const errorData = await res.json();
                      // console.error('❌ Cancellation failed:', errorData);
                      setCancellationMessage(`Could not cancel the booking: ${errorData.error || 'Please try again.'}`);
                      setShowCancellation(true);
                    }
                  } catch (error) {
                    // console.error('❌ Network error during cancellation:', error);
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
      {/* Modal de espera de pago online */}
      <Modal isOpen={isOnlinePaymentLoading} onClose={() => {}}>
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-lg font-bold mb-2 text-blue-600 text-center">Please wait...</h2>
          <p className="text-gray-700 text-center">You are being redirected to the payment gateway.</p>
        </div>
      </Modal>
    </section>
  );
}
