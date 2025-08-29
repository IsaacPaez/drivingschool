"use client";

import React from "react";
import Image from "next/image";

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
  onSelectedSlotsChange
}: ScheduleTableProps) {
  
  // Helper functions
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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
      // Search across all instructors for the lesson
      for (const instructor of instructors) {
        const lesson = instructor.schedule_driving_lesson?.find(l => {
          const lessonKey = `${l.date}-${l.start}-${l.end}`;
          return lessonKey === slotKey && l.status === "available";
        });
        if (lesson) {
          const startMin = timeToMinutes(lesson.start);
          const endMin = timeToMinutes(lesson.end);
          totalMinutes += (endMin - startMin);
          break;
        }
      }
    });
    
    return Math.round(totalMinutes / 60 * 100) / 100;
  }, [instructors, selectedSlots, timeToMinutes]);

  // Function to create grouped schedule like Book-Now
  const createGroupedSchedule = () => {
    const grouped: { [instructorId: string]: { instructor: Instructor, schedule: { date: string; slots: ScheduleEntry[] }[] } } = {};
    
    instructors.forEach(instructor => {
      if (instructor.schedule_driving_lesson) {
        const scheduleByDate: { [date: string]: ScheduleEntry[] } = {};
        
        instructor.schedule_driving_lesson.forEach(lesson => {
          if (!scheduleByDate[lesson.date]) {
            scheduleByDate[lesson.date] = [];
          }
          scheduleByDate[lesson.date].push(lesson);
        });
        
        const schedule = Object.entries(scheduleByDate).map(([date, slots]) => ({ date, slots }));
        grouped[instructor._id] = { instructor, schedule };
      }
    });
    
    return grouped;
  };
  
  const groupedSchedule = createGroupedSchedule();

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
        <span className="text-[#10B981]">Horarios Disponibles</span>
      </h2>
      <p className="text-center text-gray-600 mb-6 text-sm">
        Showing driving lesson appointments. Green slots are available for booking.
      </p>
      
      {/* Week Navigation */}
      <div className="flex flex-row justify-center items-center mb-8 gap-2 sm:gap-4">
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

      {/* Available Instructors */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-center mb-3 text-black">Available Instructors</h3>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {instructors.map((instructor) => {
            const availableCount = instructor.schedule_driving_lesson?.filter(
              lesson => lesson.status === "available"
            ).length || 0;

            return (
              <div
                key={instructor._id}
                className="border rounded-lg p-3 text-center bg-white shadow-sm"
              >
                <Image
                  src={instructor.photo || '/default-instructor.png'}
                  alt={instructor.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                />
                <h4 className="font-semibold text-sm text-black">{instructor.name}</h4>
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {availableCount} available
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Table - Using Book-Now exact structure */}
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
                    
                    // Find all slots for all instructors at this time and date
                    let slotsAtTime: { instructor: Instructor; lesson: ScheduleEntry }[] = [];
                    
                    Object.values(groupedSchedule).forEach(({ instructor, schedule }) => {
                      const daySchedule = schedule.find(s => s.date === dateString);
                      if (daySchedule && Array.isArray(daySchedule.slots)) {
                        daySchedule.slots.forEach(slot => {
                          const slotStartMin = timeToMinutes(slot.start);
                          const slotEndMin = timeToMinutes(slot.end);
                          const blockStartMin = timeToMinutes(block.start);
                          
                          // Check if this block is covered by this slot
                          if (blockStartMin >= slotStartMin && blockStartMin < slotEndMin) {
                            slotsAtTime.push({ instructor, lesson: slot });
                          }
                        });
                      }
                    });
                    
                    // Filter out slots that should be hidden (same logic as Book-Now)
                    slotsAtTime = slotsAtTime.filter(({ lesson }) => {
                      return !(
                        lesson.status === 'cancelled' || 
                        (lesson.studentId && 
                         (lesson.status === 'booked' || lesson.status === 'scheduled' || lesson.status === 'pending') &&
                         (!userId || lesson.studentId.toString() !== userId))
                      );
                    });
                    
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
                      
                      // Slot available for booking
                      if ((slot.status === 'available' || slot.status === 'free') && !slot.paid) {
                        const isSelected = isSlotSelected(slot);
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
                            <div className="text-xs">{instructor.name}</div>
                            <div className="text-xs">{isSelected ? 'Selected' : 'Available'}</div>
                          </td>
                        );
                      }
                      // Slot pending del usuario actual
                      if (slot.status === 'pending' && slot.studentId && userId && slot.studentId.toString() === userId) {
                        return (
                          <td 
                            key={date.toDateString()} 
                            rowSpan={rowSpan}
                            className="border border-gray-300 py-1 bg-orange-200 text-orange-800 font-bold min-w-[80px] w-[80px]"
                          >
                            <div className="text-xs">{instructor.name}</div>
                            <div className="text-xs">Your Pending</div>
                          </td>
                        );
                      }
                      // Slot booked del usuario actual
                      if ((slot.status === 'scheduled' || slot.status === 'booked' || slot.paid) && slot.studentId && userId && slot.studentId.toString() === userId) {
                        return (
                          <td 
                            key={date.toDateString()} 
                            rowSpan={rowSpan}
                            className="border border-gray-300 py-1 bg-blue-500 text-white font-bold min-w-[80px] w-[80px]"
                          >
                            <div className="text-xs">{instructor.name}</div>
                            <div className="text-xs">Your Booking</div>
                          </td>
                        );
                      }
                      // Empty slot or other states - show "-"
                      return (
                        <td key={date.toDateString()} className="border border-gray-300 py-1 bg-gray-50 text-black min-w-[80px] w-[80px]">-</td>
                      );
                    } else if (slotsAtTime.length > 0) {
                      // This block is covered by a slot that started in a previous row
                      return <React.Fragment key={date.toDateString()}></React.Fragment>;
                    }
                    
                    // Always show something - if no slot, show '-'
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

      {/* Selected Hours Summary and Book Button */}
      {selectedSlots.size > 0 && selectedProduct && (
        <div className="mt-6 text-center bg-blue-50 rounded-lg p-6">
          <div className="mb-4">
            <p className="text-blue-800 font-semibold text-lg">
              Selected: {calculateSelectedHours()} hours of {selectedProduct.duration || 0} hours needed
            </p>
            {calculateSelectedHours() === (selectedProduct.duration || 0) && (
              <p className="text-green-600 font-medium mt-2">
                ✓ Perfect! You have selected the exact hours needed for your package.
              </p>
            )}
          </div>
          
          {calculateSelectedHours() === (selectedProduct.duration || 0) ? (
            <button
              onClick={() => {
                // Convert selected slots to the format expected by onTimeSlotSelect
                const selectedLessons: ScheduleEntry[] = [];
                const instructorsInvolved: Instructor[] = [];
                
                selectedSlots.forEach(slotKey => {
                  // Search across all instructors for the lesson
                  for (const instructor of instructors) {
                    const lesson = instructor.schedule_driving_lesson?.find(l => {
                      const lessonKey = `${l.date}-${l.start}-${l.end}`;
                      return lessonKey === slotKey && l.status === "available";
                    });
                    if (lesson) {
                      selectedLessons.push(lesson);
                      if (!instructorsInvolved.some(i => i._id === instructor._id)) {
                        instructorsInvolved.push(instructor);
                      }
                      break;
                    }
                  }
                });
                
                if (selectedLessons.length > 0) {
                  const firstLesson = selectedLessons[0];
                  const timeSlot: SelectedTimeSlot = {
                    date: firstLesson.date,
                    start: firstLesson.start,
                    end: firstLesson.end,
                    instructors: instructorsInvolved
                  };
                  onTimeSlotSelect(timeSlot, firstLesson);
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg shadow-lg"
            >
              Book Selected Hours ({selectedSlots.size} slots)
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold cursor-not-allowed text-lg"
            >
              Select {selectedProduct.duration || 0} hours to continue
            </button>
          )}
          
          <div className="mt-4">
            <button
              onClick={() => onSelectedSlotsChange(new Set())}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Clear All Selections
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
