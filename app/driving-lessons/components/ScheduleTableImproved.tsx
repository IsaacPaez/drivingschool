"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";
import { useAllDrivingLessonsSSE } from "@/hooks/useAllDrivingLessonsSSE";
import { useCart } from "@/app/context/CartContext";

interface Instructor {
  _id: string;
  name: string;
  photo?: string;
  email?: string;
  schedule_driving_lesson?: ScheduleEntry[];
}

interface ScheduleEntry {
  date: string;
  start: string;
  end: string;
  status: string;
  classType?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  selectedProduct?: string;
  studentId?: string;
  studentName?: string;
  paid?: boolean;
  paymentMethod?: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  buttonLabel: string;
  category: string;
  duration?: number;
  media?: string[];
}

interface SelectedTimeSlot {
  date: string;
  start: string;
  end: string;
  instructors: Instructor[];
}

interface ScheduleTableProps {
  selectedProduct: Product | null;
  weekOffset: number;
  onWeekOffsetChange: (offset: number) => void;
  weekDates: Date[];
  instructors: Instructor[];
  userId: string;
  onTimeSlotSelect: (timeSlot: SelectedTimeSlot, lesson: ScheduleEntry) => void;
  onSelectedHoursChange?: (hours: number) => void;
  selectedSlots: Set<string>;
  onSelectedSlotsChange: (slots: Set<string>) => void;
  selectedInstructorForSchedule: Instructor | null;
  selectedHours: number;
  onRequestSchedule: () => void;
}

export default function ScheduleTableImproved({
  selectedProduct,
  weekOffset,
  onWeekOffsetChange,
  weekDates,
  instructors,
  userId,
  onTimeSlotSelect,
  onSelectedHoursChange,
  selectedSlots,
  onSelectedSlotsChange,
  selectedInstructorForSchedule,
  selectedHours,
  onRequestSchedule
}: ScheduleTableProps) {
  
  // Use SSE hook for real-time schedule updates for all instructors
  const instructorIds = React.useMemo(() => 
    instructors.map(instructor => instructor._id), 
    [instructors]
  );
  const { 
    getScheduleForInstructor, 
    getErrorForInstructor, 
    isConnectedForInstructor,
    getAllSchedules 
  } = useAllDrivingLessonsSSE(instructorIds);
  
  // Access cart to know which pending slots are still in the cart
  const { cart } = useCart();
  const pendingSlotKeysInCart = React.useMemo(() => {
    const keys = new Set<string>();
    cart.forEach((item: any) => {
      if (Array.isArray(item.selectedSlots)) {
        item.selectedSlots.forEach((k: string) => keys.add(k));
      }
    });
    return keys;
  }, [cart]);

  // Helper to decide availability, considering pending-but-not-in-cart as available
  const isEffectivelyAvailable = React.useCallback((lesson: any): boolean => {
    if (!lesson) return false;
    if ((lesson.status === 'available' || lesson.status === 'free') && !lesson.paid) return true;
    const slotKey = `${lesson.date}-${lesson.start}-${lesson.end}`;
    const isUsersPending = lesson.status === 'pending' && lesson.studentId && userId && lesson.studentId.toString() === userId;
    // If it's pending of this user but payment method is physical (pay at location), DO NOT treat as available
    if (isUsersPending && lesson.paymentMethod === 'physical') return false;
    // Otherwise, if it's user's pending but no longer in cart, treat as available
    if (isUsersPending && !pendingSlotKeysInCart.has(slotKey)) return true;
    return false;
  }, [pendingSlotKeysInCart, userId]);
  
  const [showMultipleInstructorsModal, setShowMultipleInstructorsModal] = useState(false);
  const [multipleInstructorsData, setMultipleInstructorsData] = useState<{
    instructors: { instructor: Instructor; lesson: ScheduleEntry }[];
    date: string;
    time: string;
  } | null>(null);
  
  // Function to handle multiple instructors click
  const handleMultipleInstructorsClick = (
    instructors: { instructor: Instructor; lesson: ScheduleEntry }[],
    date: string,
    time: string
  ) => {
    setMultipleInstructorsData({ instructors, date, time });
    setShowMultipleInstructorsModal(true);
  };
  
  // Helper functions
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const formatDate = (date: Date) => {
    // Use UTC methods to avoid timezone issues
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    return `${year}-${pad(month)}-${pad(day)}`;
  };

  const timeToMinutes = React.useCallback((time: string): number => {
    if (!time || typeof time !== 'string') return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }, []);

  // Generate time blocks like Book-Now (exactly same logic)
  const allTimes: { start: string, end: string }[] = [];
  for (let h = 6; h < 20; h++) {
    allTimes.push({ start: `${pad(h)}:00`, end: `${pad(h)}:30` });
    allTimes.push({ start: `${pad(h)}:30`, end: `${pad(h+1)}:00` });
  }

  // Helper function to toggle slot selection
  const toggleSlotSelection = (lesson: ScheduleEntry): void => {
    const slotKey = `${lesson.date}-${lesson.start}-${lesson.end}`;
    const newSelectedSlots = new Set(selectedSlots);
    
    if (selectedSlots.has(slotKey)) {
      newSelectedSlots.delete(slotKey);
    } else {
      newSelectedSlots.add(slotKey);
    }
    
    onSelectedSlotsChange(newSelectedSlots);
  };

  // Check if a slot is selected
  const isSlotSelected = (lesson: ScheduleEntry): boolean => {
    const slotKey = `${lesson.date}-${lesson.start}-${lesson.end}`;
    return selectedSlots.has(slotKey);
  };

  // Helper function like Book-Now to determine if this is the starting row for a slot
  const isRowStart = (dateString: string, slot: ScheduleEntry, blockStart: string) => {
    const slotStartMin = timeToMinutes(slot.start);
    const blockStartMin = timeToMinutes(blockStart);
    return slotStartMin === blockStartMin;
  };

  // Helper function to calculate selected hours
  const calculateSelectedHours = React.useCallback((): number => {
    let totalMinutes = 0;
    selectedSlots.forEach(slotKey => {
      // Search across all instructors for the lesson (both SSE and static data)
      for (const instructor of instructors) {
        // First try SSE data
        const sseSchedule = getScheduleForInstructor(instructor._id);
        let lesson: any = null;
        
        if (sseSchedule && Array.isArray(sseSchedule)) {
          lesson = sseSchedule.find((l: any) => {
            const lessonKey = `${l.date}-${l.start}-${l.end}`;
            return lessonKey === slotKey && isEffectivelyAvailable(l);
          }) || null;
        }
        
        // Fallback to static data if SSE data not found
        if (!lesson && instructor.schedule_driving_lesson) {
          lesson = instructor.schedule_driving_lesson.find(l => {
            const lessonKey = `${l.date}-${l.start}-${l.end}`;
            return lessonKey === slotKey && isEffectivelyAvailable(l);
          });
        }
        
        if (lesson) {
          const startMin = timeToMinutes(lesson.start);
          const endMin = timeToMinutes(lesson.end);
          totalMinutes += (endMin - startMin);
          break;
        }
      }
    });
    
    return Math.round(totalMinutes / 60 * 100) / 100;
  }, [instructors, selectedSlots, timeToMinutes, getScheduleForInstructor, isEffectivelyAvailable]);

  // Function to create grouped schedule like Book-Now
  const createGroupedSchedule = () => {
    const grouped: { [instructorId: string]: { instructor: Instructor, schedule: { date: string; slots: ScheduleEntry[] }[] } } = {};
    
    // Use SSE data if available, otherwise fall back to static instructor data
    const instructorsToShow = selectedInstructorForSchedule 
      ? [selectedInstructorForSchedule]
      : instructors;

    instructorsToShow.forEach(instructor => {
      // Try to get SSE data first
      const sseSchedule = getScheduleForInstructor(instructor._id);
      
      if (sseSchedule && Array.isArray(sseSchedule) && sseSchedule.length > 0) {
        // Process SSE data similar to Book-Now
        const scheduleByDate: { [date: string]: ScheduleEntry[] } = {};
        
        sseSchedule.forEach((lesson: any) => {
          if (!scheduleByDate[lesson.date]) {
            scheduleByDate[lesson.date] = [];
          }
          scheduleByDate[lesson.date].push(lesson);
        });
        
        const schedule = Object.entries(scheduleByDate).map(([date, slots]) => ({ date, slots }));
        grouped[instructor._id] = { 
          instructor, 
          schedule 
        };
        console.log(`📅 Using SSE data for instructor ${instructor.name}:`, schedule.length, 'days with slots');
      } else if (instructor.schedule_driving_lesson) {
        // Fallback to static data
        const scheduleByDate: { [date: string]: ScheduleEntry[] } = {};
        
        instructor.schedule_driving_lesson.forEach(lesson => {
          if (!scheduleByDate[lesson.date]) {
            scheduleByDate[lesson.date] = [];
          }
          scheduleByDate[lesson.date].push(lesson);
        });
        
        const schedule = Object.entries(scheduleByDate).map(([date, slots]) => ({ date, slots }));
        grouped[instructor._id] = { instructor, schedule };
        console.log(`📅 Using static data for instructor ${instructor.name}:`, schedule.length, 'days with slots');
      } else {
        console.log(`⚠️ No schedule data found for instructor ${instructor.name}`);
      }
    });
    
    return grouped;
  };
  
  const groupedSchedule = createGroupedSchedule();
  
  // Debug: Log SSE data
  React.useEffect(() => {
    console.log("🔍 Debug - SSE data for all instructors:");
    instructors.forEach(instructor => {
      const sseData = getScheduleForInstructor(instructor._id);
      console.log(`  ${instructor.name} (${instructor._id}):`, sseData?.length || 0, 'slots');
    });
  }, [instructors, getScheduleForInstructor]);

  // Notify parent component when selected hours change
  React.useEffect(() => {
    if (onSelectedHoursChange) {
      const selectedHours = calculateSelectedHours();
      onSelectedHoursChange(selectedHours);
    }
  }, [selectedSlots, onSelectedHoursChange, calculateSelectedHours]);

  if (!selectedProduct) {
    return (
      <div className="w-full lg:w-2/3 mt-6 lg:mt-0">
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">
            Please select a driving package to view available times.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-2/3 mt-6 lg:mt-0">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-4 mt-12">
        <span className="text-[#10B981]">Available Schedules</span>
      </h2>

      {/* Connection Status Indicator - Only show when there are actual connection errors */}
      {(() => {
        const hasConnectionErrors = instructors.some(instructor => getErrorForInstructor(instructor._id));
        
        if (hasConnectionErrors) {
          return (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-yellow-800 text-sm">
                  Problemas de conexión detectados. Algunos horarios pueden no mostrarse correctamente.
                </span>
              </div>
            </div>
          );
        }
        
        // Remove the "Conectando con los instructores..." message
        return null;
      })()}

      


      {/* Selected Package Info - Moved from PackageSelector */}
      {selectedProduct && (
        <div className="bg-blue-50 p-3 rounded-lg mb-4 w-full max-w-3xl mx-auto shadow-lg border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2 text-base">Selected Package:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="space-y-1">
              <p className="text-blue-700 text-sm"><strong>Package:</strong> {selectedProduct.title}</p>
              <p className="text-blue-700 text-sm"><strong>Price:</strong> ${selectedProduct.price}</p>
              {selectedProduct.duration && (
                <p className="text-blue-700 text-sm"><strong>Duration:</strong> {selectedProduct.duration} hours</p>
                  )}
                </div>
            <div>
              <p className="text-blue-700 text-sm"><strong>Description:</strong> {selectedProduct.description}</p>
                </div>
        </div>
        
          {/* Hours Selection Status */}
          <div className="mt-3 p-3 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
            <p className="text-gray-700 font-medium text-center mb-1 text-sm">
              <strong>Hours selected:</strong> {selectedHours} of {selectedProduct.duration || 0} available
            </p>
            {selectedHours > 0 && selectedHours < (selectedProduct.duration || 0) && (
              <p className="text-orange-600 text-xs text-center">
                Please select {(selectedProduct.duration || 0) - selectedHours} more hours to continue
              </p>
            )}
            {selectedHours === (selectedProduct.duration || 0) && selectedHours > 0 && (
              <p className="text-green-600 text-xs text-center font-medium">
                ✓ Perfect! You have selected all required hours.
              </p>
            )}
            {selectedHours > (selectedProduct.duration || 0) && (
              <p className="text-red-600 text-xs text-center">
                You have selected too many hours. Please deselect {selectedHours - (selectedProduct.duration || 0)} hours.
              </p>
        )}
      </div>
      
          {/* Request Schedule Button */}
          <div className="mt-3">
            {selectedHours === (selectedProduct.duration || 0) && selectedHours > 0 ? (
              <button
                onClick={onRequestSchedule}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg text-sm"
              >
                Request Schedule ({selectedHours} hours selected)
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold cursor-not-allowed text-sm"
              >
                {selectedHours === 0 
                  ? "Select hours from schedule to continue" 
                  : `Select ${selectedProduct.duration || 0} hours to continue`
                }
              </button>
            )}
          </div>
        </div>
      )}

      {/* Week Navigation - Moved below package info */}
      <div className="flex flex-row justify-center items-center mb-6 gap-2 sm:gap-4">
        <button
          onClick={() => onWeekOffsetChange(weekOffset - 1)}
          className="px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 font-semibold shadow transition-all duration-200"
        >
          ← Previous week
        </button>
        <button
          onClick={() => onWeekOffsetChange(weekOffset + 1)}
          className="px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 font-semibold shadow transition-all duration-200"
        >
          Next week →
        </button>
      </div>

      {/* Schedule Table - Using Book-Now exact structure */}
      <div className="overflow-x-auto w-full mt-6 relative">

        
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
                      {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {allTimes.map((block, index) => {
              // Function to determine if this is the starting row for a slot (from Book-Now)
              const isRowStartForSlot = (dateString: string, slot: ScheduleEntry) => {
                const slotStartMin = timeToMinutes(slot.start);
                const blockStartMin = timeToMinutes(block.start);
                return slotStartMin === blockStartMin;
              };

              return (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 p-1 font-bold text-black min-w-[70px] w-[70px] text-xs">
                    {`${block.start}-${block.end}`}
                  </td>
                  {weekDates.map((date) => {
                    const dateString = formatDate(date);
                    
                    // Debug: Log date formatting for first time block
                    if (block.start === '06:00') {
                      console.log(`🗓️ Date formatting: ${date.toDateString()} -> ${dateString}`);
                    }
                    
                    // Find all slots for all instructors at this time and date
                    let slotsAtTime: { instructor: Instructor; lesson: ScheduleEntry }[] = [];
                    let hasDrivingTestConflict = false;
                    
                    Object.values(groupedSchedule).forEach(({ instructor, schedule }) => {
                      const daySchedule = schedule.find(s => s.date === dateString);
                      if (daySchedule && Array.isArray(daySchedule.slots)) {
                        // Debug: Log when slots are found
                        if (daySchedule.slots.length > 0 && block.start === '15:00') {
                          console.log(`🎯 Found slots for ${dateString}:`, daySchedule.slots.map(s => `${s.start}-${s.end} ${s.status}`));
                        }
                        daySchedule.slots.forEach(slot => {
                          const slotStartMin = timeToMinutes(slot.start);
                          const slotEndMin = timeToMinutes(slot.end);
                          const blockStartMin = timeToMinutes(block.start);
                          const blockEndMin = timeToMinutes(block.end);
                          
                          // Check if this block overlaps with this slot
                          if (blockStartMin < slotEndMin && blockEndMin > slotStartMin) {
                            // Check if this is a driving test (which should show as "-" in driving lessons view)
                            if (slot.classType === 'driving test' || slot.classType === 'driving_test') {
                              hasDrivingTestConflict = true;
                            } else {
                              // Only add driving lesson slots, not driving tests
                              slotsAtTime.push({ instructor, lesson: slot });
                            }
                          }
                        });
                      }
                    });
                    
                    // Filter out slots that should be hidden (same logic as Book-Now)
                    slotsAtTime = slotsAtTime.filter(({ lesson }) => {
                      return !(
                        lesson.status === 'cancelled' || 
                        (lesson.studentId && 
                         (lesson.status === 'booked' || lesson.status === 'scheduled') &&
                         (!userId || lesson.studentId.toString() !== userId)) ||
                        (lesson.status === 'pending' && lesson.studentId && (!userId || lesson.studentId.toString() !== userId))
                      );
                    });
                    
                    // Debug: Log when no slots found
                    if (slotsAtTime.length === 0 && !hasDrivingTestConflict) {
                      console.log(`🔍 No slots found for ${dateString} at ${block.start}-${block.end}`);
                    }
                    
                    // Handle multiple instructors in the same time block
                    if (slotsAtTime.length > 0) {
                      // Find the slot that starts at this exact block (for rowSpan)
                      const slotStartingHere = slotsAtTime.find(({ lesson }) => 
                        isRowStartForSlot(dateString, lesson)
                      );
                      
                      if (slotStartingHere) {
                        const { instructor, lesson: slot } = slotStartingHere;
                        
                        // Calculate rowSpan (same logic as Book-Now)
                        const slotStartMin = timeToMinutes(slot.start);
                        const slotEndMin = timeToMinutes(slot.end);
                        const slotDurationMin = slotEndMin - slotStartMin;
                        const rowSpan = Math.ceil(slotDurationMin / 30);
                        
                        // Check if there are multiple instructors in this time block
                        const multipleInstructors = slotsAtTime.length > 1;
                        
                        // Slot available for booking (or pending but no longer present in user's cart -> treat as available immediately)
                        const slotKey = `${slot.date}-${slot.start}-${slot.end}`;
                        const isUsersPendingHere = slot.status === 'pending' && slot.studentId && userId && slot.studentId.toString() === userId;
                        const isPendingButNotInCart = isUsersPendingHere && !pendingSlotKeysInCart.has(slotKey) && slot.paymentMethod !== 'physical';
                        if (((slot.status === 'available' || slot.status === 'free') && !slot.paid) || isPendingButNotInCart) {
                          const isSelected = isSlotSelected(slot);
                          
                          if (multipleInstructors) {
                            // Special design for multiple instructors - split the cell
                            return (
                              <td 
                                key={date.toDateString()} 
                                rowSpan={rowSpan}
                                className="border border-gray-300 py-1 font-bold cursor-pointer min-w-[80px] w-[80px] relative overflow-hidden"
                                onClick={() => handleMultipleInstructorsClick(slotsAtTime, dateString, `${block.start}-${block.end}`)}
                                title={`Multiple instructors available: ${slotsAtTime.map(s => s.instructor.name).join(', ')}`}
                              >
                                {/* Split design - top half and bottom half */}
                                <div className="absolute inset-0 flex flex-col">
                                  <div className="flex-1 bg-green-200 hover:bg-green-300 flex items-center justify-center">
                                    <div className="text-xs text-center">
                                      <div className="font-bold">Driving Lesson</div>
                                      <div className="text-xs">{slot.start} - {slot.end}</div>
                                      <div className="text-xs">Available</div>
                                    </div>
                                  </div>
                                  <div className="flex-1 bg-blue-200 hover:bg-blue-300 flex items-center justify-center border-t border-gray-300">
                                    <div className="text-xs text-center">
                                      <div className="font-bold">
                                        {slotsAtTime.length > 5 ? `+${slotsAtTime.length - 1} more` : `+${slotsAtTime.length - 1} more`}
                                      </div>
                                      <div className="text-xs">
                                        {slotsAtTime.length > 5 ? 'Many available' : 'Click to see all'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            );
                          } else {
                            // Single instructor - normal design
                            return (
                              <td 
                                key={date.toDateString()} 
                                rowSpan={rowSpan}
                                className={`border border-gray-300 py-1 font-bold cursor-pointer min-w-[80px] w-[80px] ${
                                  isSelected 
                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                    : 'bg-green-200 text-black hover:bg-green-300'
                                }`}
                                onClick={() => toggleSlotSelection(slot)}
                              >
                                <div className="text-xs font-semibold">Driving Lesson</div>
                                <div className="text-xs">
                                  {slot.start} - {slot.end}
                                </div>
                                <div className="text-xs">
                                  {isSelected ? 'Selected' : 'Available'}
                                </div>
                              </td>
                            );
                          }
                        }
                        // Slot pending del usuario actual - mostrar si sigue en el carrito o si es 'physical' (pago en sitio)
                        const isUsersPending = slot.status === 'pending' && slot.studentId && userId && slot.studentId.toString() === userId;
                        if (isUsersPending && (pendingSlotKeysInCart.has(`${slot.date}-${slot.start}-${slot.end}`) || slot.paymentMethod === 'physical')) {
                          return (
                            <td 
                              key={date.toDateString()} 
                              rowSpan={rowSpan}
                              className="border border-gray-300 py-1 bg-orange-200 text-orange-800 font-bold min-w-[80px] w-[80px]"
                            >
                              <div className="text-xs font-semibold">Driving Lesson</div>
                              <div className="text-xs">{slot.start} - {slot.end}</div>
                              <div className="text-xs">Pending</div>
                            </td>
                          );
                        }
                        
                        // Slot booked del usuario actual
                        const isUsersBooked = (slot.status === 'scheduled' || slot.status === 'booked' || slot.paid) && slot.studentId && userId && slot.studentId.toString() === userId;
                        if (isUsersBooked) {
                          return (
                            <td 
                              key={date.toDateString()} 
                              rowSpan={rowSpan}
                              className="border border-gray-300 py-1 bg-blue-500 text-white font-bold min-w-[80px] w-[80px]"
                            >
                              <div className="text-xs font-semibold">Driving Lesson</div>
                              <div className="text-xs">{slot.start} - {slot.end}</div>
                              <div className="text-xs">Booked</div>
                            </td>
                          );
                        }
                        
                        // Slot pending de otro usuario - mostrar como no disponible
                        if (slot.status === 'pending' && slot.studentId && userId && slot.studentId.toString() !== userId) {
                          return (
                            <td 
                              key={date.toDateString()} 
                              rowSpan={rowSpan}
                              className="border border-gray-300 py-1 bg-gray-300 text-gray-600 font-bold min-w-[80px] w-[80px]"
                            >
                              <div className="text-xs font-semibold">Driving Lesson</div>
                              <div className="text-xs">{slot.start} - {slot.end}</div>
                              <div className="text-xs">Reserved</div>
                            </td>
                          );
                        }
                        
                        // Slot booked de otro usuario - mostrar como no disponible
                        if ((slot.status === 'scheduled' || slot.status === 'booked' || slot.paid) && slot.studentId && userId && slot.studentId.toString() !== userId) {
                          return (
                            <td 
                              key={date.toDateString()} 
                              rowSpan={rowSpan}
                              className="border border-gray-300 py-1 bg-red-200 text-red-800 font-bold min-w-[80px] w-[80px]"
                            >
                              <div className="text-xs font-semibold">Driving Lesson</div>
                              <div className="text-xs">{slot.start} - {slot.end}</div>
                              <div className="text-xs">Booked</div>
                            </td>
                          );
                        }
                        // Empty slot or other states - show "-"
                        return (
                          <td key={date.toDateString()} className="border border-gray-300 py-1 bg-gray-50 text-black min-w-[80px] w-[80px] text-center text-xs">-</td>
                        );
                      } else {
                        // This block is covered by a slot that started in a previous row
                        // Don't render anything for this cell (it's covered by rowSpan from above)
                        return null;
                      }
                    }
                    
                    // If there's a driving test conflict, show "-" (unavailable)
                    if (hasDrivingTestConflict) {
                      return (
                        <td key={date.toDateString()} className="border border-gray-300 py-1 bg-gray-50 text-gray-500 min-w-[80px] w-[80px] text-center text-xs">-</td>
                      );
                    }
                    
                    // Always show something - if no slot, show "-"
                    console.log(`✅ Showing "-" for ${dateString} at ${block.start}-${block.end}`);
                    return (
                      <td key={date.toDateString()} className="border border-gray-300 py-1 bg-gray-50 text-black min-w-[80px] w-[80px] text-center text-xs">-</td>
                    );
                  })}
                </tr>
              );
            }).filter(row => row !== null)}
          </tbody>
        </table>
        

      </div>

      
      {/* Modal for multiple instructors */}
      <Modal
        isOpen={showMultipleInstructorsModal}
        onClose={() => setShowMultipleInstructorsModal(false)}
      >
        <div className="p-4 max-w-md mx-auto">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Select Instructor ({multipleInstructorsData?.instructors.length || 0} available)
            </h3>
            <p className="text-sm text-gray-600">
              {multipleInstructorsData?.date} at {multipleInstructorsData?.time}
            </p>
            {multipleInstructorsData && multipleInstructorsData.instructors.length > 10 && (
              <p className="text-xs text-blue-600 mt-1">
                💡 Scroll down to see all {multipleInstructorsData.instructors.length} instructors
              </p>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {multipleInstructorsData?.instructors.map(({ instructor, lesson }, index) => (
              <div
                key={instructor._id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  const slotKey = `${lesson.date}-${lesson.start}-${lesson.end}`;
                  onSelectedSlotsChange(new Set([slotKey]));
                  setShowMultipleInstructorsModal(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    {instructor.photo ? (
                      <Image
                        src={instructor.photo}
                        alt={instructor.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {instructor.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-800 truncate">{instructor.name}</div>
                    <div className="text-sm text-gray-500">Available</div>
                  </div>
                </div>
                <div className="text-sm text-green-600 font-medium flex-shrink-0">Select</div>
              </div>
            ))}
          </div>
          
          {/* Show count if many instructors */}
          {multipleInstructorsData && multipleInstructorsData.instructors.length > 5 && (
            <div className="mt-3 text-center text-sm text-gray-500">
              Showing {multipleInstructorsData.instructors.length} available instructors
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowMultipleInstructorsModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
