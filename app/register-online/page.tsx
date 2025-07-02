"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/globals.css";
import Modal from "@/components/Modal";
import Image from "next/image";
import { useAuth } from "@/components/AuthContext";
import LoginModal from "@/components/LoginModal";
import { useRouter } from "next/navigation";

interface Slot {
  _id: string;
  start: string;
  end: string;
  status: 'free' | 'scheduled' | 'cancelled' | 'available';
  studentId?: string;
  booked?: boolean;
  classType?: string;
  ticketClassId?: string;
  amount?: number;
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

interface TicketClass {
  _id: string;
  type: string;
  hour: string;
  endhour: string;
  duration: string;
  cupos: number;
  students: {
    studentId: string;
    reason?: string;
    citation_number?: string;
    citation_ticket?: string;
    course_country?: string;
  }[];
  classInfo?: {
    title: string;
    price: number;
    alsoKnownAs: string[];
  };
}

export default function RegisterOnlinePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [ticketClassData, setTicketClassData] = useState<{[key: string]: TicketClass}>({});
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedClassType, setSelectedClassType] = useState<string>("A.D.I");
  const [weekOffset, setWeekOffset] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showCancellation, setShowCancellation] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTicketClass, setSelectedTicketClass] = useState<{
    slot: Slot;
    ticketClass: TicketClass;
    dateString: string;
  } | null>(null);

  const { user } = useAuth();
  const userId = user?._id || "";

  const classTypes = ["A.D.I", "B.D.I", "D.A.T.E"];

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch instructors
        const instructorsRes = await fetch('/api/instructors');
        if (instructorsRes.ok) {
          const instructorsData = await instructorsRes.json();
          setInstructors(instructorsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch ticket classes when instructor changes
  useEffect(() => {
    const fetchTicketClasses = async () => {
      if (!selectedInstructorId) {
        setTicketClassData({});
        return;
      }

      try {
        const ticketClassesRes = await fetch(`/api/ticketclasses?instructorId=${selectedInstructorId}`);
        if (ticketClassesRes.ok) {
          const ticketClassesArray = await ticketClassesRes.json();
          // Convert array to object with _id as key
          const ticketClassesObj = ticketClassesArray.reduce((acc: {[key: string]: TicketClass}, tc: TicketClass) => {
            acc[tc._id] = tc;
            return acc;
          }, {});
          setTicketClassData(ticketClassesObj);
        }
      } catch (error) {
        console.error('Error fetching ticket classes:', error);
      }
    };

    fetchTicketClasses();
  }, [selectedInstructorId]);

  // Filter instructor when selected
  useEffect(() => {
    if (selectedInstructorId && instructors.length > 0) {
      const instructor = instructors.find(inst => inst._id === selectedInstructorId);
      setSelectedInstructor(instructor || null);
    }
  }, [selectedInstructorId, instructors]);

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
      const newDate = new Date(startOfWeek);
      newDate.setDate(startOfWeek.getDate() + i);
      return newDate;
    });
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  const renderScheduleTable = () => {
    if (!selectedInstructor || !selectedDate) {
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
          <p className="text-gray-400 text-center mt-4">Select an instructor to see available {selectedClassType} classes.</p>
        </div>
      );
    }

    const weekDates = getWeekDates(selectedDate);
    
    // Generate 30-minute time blocks
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
              const shouldRenderRow = weekDates.some((date) => {
                const dateString = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
                
                if (!selectedInstructor?.schedule) return true;
                
                // Find schedule for this date
                const daySchedule = selectedInstructor.schedule.find(s => s.date === dateString);
                if (!daySchedule) return true;
                
                // Find slot that has a ticket class
                const slot = daySchedule.slots.find(slot => 
                  slot.ticketClassId && 
                  slot.classType === selectedClassType
                );

                if (!slot) return true; // Show empty row
                
                // Get ticket class data
                if (!slot.ticketClassId) return true;
                const ticketClass = ticketClassData[slot.ticketClassId];
                if (!ticketClass) return true;
                
                // Check if this time block overlaps with the ticket class
                const toMinutes = (time: string) => {
                  const [hours, minutes] = time.split(':').map(Number);
                  return hours * 60 + minutes;
                };
                
                const classStartMin = toMinutes(slot.start);
                const classEndMin = toMinutes(slot.end);
                const blockStartMin = toMinutes(block.start);
                
                // If there's a class and this block doesn't start the class, filter out
                if (blockStartMin > classStartMin && blockStartMin < classEndMin) {
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
                    
                    if (!selectedInstructor?.schedule) {
                      return (
                        <td key={date.toDateString()} className="border border-gray-300 p-2 text-gray-300 min-w-[80px] w-[80px]">
                          <div className="text-xs">No Schedule</div>
                        </td>
                      );
                    }

                    // Find schedule for this date
                    const daySchedule = selectedInstructor.schedule.find(s => s.date === dateString);
                    if (!daySchedule) {
                      return (
                        <td key={date.toDateString()} className="border border-gray-300 p-2 text-gray-300 min-w-[80px] w-[80px]">
                          <div className="text-xs">No Classes</div>
                        </td>
                      );
                    }
                    
                    // Find slot that has a ticket class of the selected type
                    const slot = daySchedule.slots.find(slot => 
                      slot.ticketClassId && 
                      slot.classType === selectedClassType
                    );

                    if (slot && slot.ticketClassId) {
                      const ticketClass = ticketClassData[slot.ticketClassId];
                      if (!ticketClass) {
                        return (
                          <td key={date.toDateString()} className="border border-gray-300 p-2 text-gray-300 min-w-[80px] w-[80px]">
                            <div className="text-xs">Loading...</div>
                          </td>
                        );
                      }

                      const toMinutes = (time: string) => {
                        const [hours, minutes] = time.split(':').map(Number);
                        return hours * 60 + minutes;
                      };
                      
                      const classStartMin = toMinutes(slot.start);
                      const classEndMin = toMinutes(slot.end);
                      const blockStartMin = toMinutes(block.start);
                      const classDurationMin = classEndMin - classStartMin;
                      const rowSpan = Math.ceil(classDurationMin / 30);
                      
                      // Check if this is the starting block for the class
                      if (blockStartMin === classStartMin) {
                        const availableSpots = ticketClass.cupos - ticketClass.students.length;
                        const isUserEnrolled = ticketClass.students.some(student => student.studentId === userId);
                        
                        // User is enrolled
                        if (isUserEnrolled) {
                          return (
                            <td key={date.toDateString()} 
                                rowSpan={rowSpan}
                                className="border border-gray-300 py-1 bg-blue-500 text-white font-bold cursor-pointer hover:bg-red-500 min-w-[80px] w-[80px]"
                                onClick={() => {
                                  // Handle cancellation
                                  setSelectedTicketClass({ slot, ticketClass, dateString });
                                  setCancellationMessage(`Are you sure you want to cancel your enrollment in ${selectedClassType} class?`);
                                  setShowCancellation(true);
                                }}
                                title="Click to cancel enrollment"
                            >
                              <div className="text-xs">Your Class</div>
                              <div className="text-xs">{slot.start}-{slot.end}</div>
                              <div className="text-xs font-bold">{selectedClassType}</div>
                              <div className="text-xs">${ticketClass.classInfo?.price || 100}</div>
                            </td>
                          );
                        }
                        
                        // Class has available spots
                        if (availableSpots > 0) {
                          return (
                            <td key={date.toDateString()} 
                                rowSpan={rowSpan}
                                className="border border-gray-300 py-1 bg-green-200 text-black font-bold cursor-pointer hover:bg-green-300 min-w-[80px] w-[80px]"
                                onClick={() => {
                                  if (!userId) {
                                    setShowAuthWarning(true);
                                    return;
                                  }
                                  setSelectedTicketClass({ slot, ticketClass, dateString });
                                  setIsBookingModalOpen(true);
                                }}
                            >
                              <div className="text-xs">Available</div>
                              <div className="text-xs">{slot.start}-{slot.end}</div>
                              <div className="text-xs font-bold">{selectedClassType}</div>
                              <div className="text-xs">${ticketClass.classInfo?.price || 100}</div>
                              <div className="text-xs text-green-700">{availableSpots} spots</div>
                            </td>
                          );
                        }
                        
                        // Class is full
                        return (
                          <td key={date.toDateString()} 
                              rowSpan={rowSpan}
                              className="border border-gray-300 py-1 bg-red-100 text-red-900 min-w-[80px] w-[80px]">
                            <div className="text-xs">Full</div>
                            <div className="text-xs">{slot.start}-{slot.end}</div>
                            <div className="text-xs font-bold">{selectedClassType}</div>
                            <div className="text-xs">${ticketClass.classInfo?.price || 100}</div>
                          </td>
                        );
                      } else if (blockStartMin > classStartMin && blockStartMin < classEndMin) {
                        // This block is covered by the class rowSpan
                        return <React.Fragment key={date.toDateString()}></React.Fragment>;
                      }
                    }
                    
                    // No class for this time slot
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

  // Booking Modal
  const renderBookingModal = () => (
    <Modal
      isOpen={isBookingModalOpen}
      onClose={() => setIsBookingModalOpen(false)}
    >
      <div className="p-6 text-black">
        <h2 className="text-xl font-bold mb-4">Enroll in {selectedClassType} Class</h2>
        {selectedTicketClass && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2"><strong>Class Type:</strong> {selectedTicketClass.ticketClass.type}</p>
                <p className="mb-2"><strong>Date:</strong> {selectedTicketClass.dateString}</p>
                <p className="mb-2"><strong>Time:</strong> {selectedTicketClass.slot.start} - {selectedTicketClass.slot.end}</p>
                <p className="mb-2"><strong>Duration:</strong> {selectedTicketClass.ticketClass.duration}</p>
              </div>
              <div>
                <p className="mb-2"><strong>Instructor:</strong> {selectedInstructor?.name}</p>
                <p className="mb-2"><strong>Price:</strong> ${selectedTicketClass.ticketClass.classInfo?.price || 100}</p>
                <p className="mb-2"><strong>Available Spots:</strong> {selectedTicketClass.ticketClass.cupos - selectedTicketClass.ticketClass.students.length}</p>
              </div>
            </div>
          </div>
        )}
        
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
              if (!userId || !selectedTicketClass) return;
              
              try {
                const res = await fetch('/api/ticketclasses/enroll', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    studentId: userId,
                    ticketClassId: selectedTicketClass.ticketClass._id,
                  }),
                });
                
                setIsBookingModalOpen(false);
                
                if (res.ok) {
                  setConfirmationMessage(`Successfully enrolled in ${selectedClassType} class!`);
                  setShowConfirmation(true);
                  // Refresh ticket classes
                  if (selectedInstructorId) {
                    const ticketClassesRes = await fetch(`/api/ticketclasses?instructorId=${selectedInstructorId}`);
                    if (ticketClassesRes.ok) {
                      const ticketClassesArray = await ticketClassesRes.json();
                      const ticketClassesObj = ticketClassesArray.reduce((acc: {[key: string]: TicketClass}, tc: TicketClass) => {
                        acc[tc._id] = tc;
                        return acc;
                      }, {});
                      setTicketClassData(ticketClassesObj);
                    }
                  }
                } else {
                  setConfirmationMessage('Could not enroll in class. Please try again.');
                  setShowConfirmation(true);
                }
              } catch (error) {
                setConfirmationMessage('Error enrolling in class. Please try again.');
                setShowConfirmation(true);
              }
            }}
          >
            Enroll Now
          </button>
        </div>
      </div>
    </Modal>
  );

  return (
    <section className="bg-white pt-32 pb-8 px-2 sm:px-6 flex flex-col items-center w-full">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 items-start">
        {/* Calendar and instructors selection */}
        <div className="w-full lg:w-1/3 flex flex-col items-center mt-8 sm:mt-12">
          <div className="mb-4 w-full flex justify-center">
            <Calendar
              onChange={(value) => handleDateChange(value as Date | null)}
              value={selectedDate}
              locale="en-US"
              className="border rounded-lg shadow-md w-full max-w-xs p-2"
            />
          </div>
          
          {/* Class Type Selector */}
          <div className="mb-4 w-full">
            <h3 className="text-lg font-semibold text-center mb-2">Select Class Type</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {classTypes.map((classType) => (
                <button
                  key={classType}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    selectedClassType === classType
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => setSelectedClassType(classType)}
                >
                  {classType}
                </button>
              ))}
            </div>
          </div>

          {/* Instructors Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 w-full">
            {instructors.map((inst) => {
              const [firstName, ...lastNameParts] = inst.name.split(' ');
              const lastName = lastNameParts.join(' ');
              return (
                <div
                  key={inst._id}
                  className={`shadow-lg rounded-xl p-2 sm:p-4 text-center cursor-pointer hover:shadow-xl transition-all w-full ${selectedInstructor?._id === inst._id ? "border-4 border-blue-500 bg-blue-100" : "bg-white"}`}
                  onClick={() => {
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

        {/* Schedule table */}
        <div className="w-full lg:w-2/3 mt-6 lg:mt-0">
          {selectedInstructorId && !selectedInstructor && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading {selectedClassType} classes schedule...</p>
            </div>
          )}
          
          {selectedInstructor && (
            <>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-4 mt-12">
                <span className="text-blue-700">{selectedInstructor.name}&apos;s </span>
                <span className="text-[#10B981]">{selectedClassType} Classes</span>
              </h2>
              <p className="text-center text-gray-600 mb-6 text-sm">
                Showing {selectedClassType} classes. Green slots are available for enrollment.
              </p>
              
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
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {renderBookingModal()}
      
      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4 text-green-600">Success!</h2>
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
      
      {/* Cancellation Modal */}
      <Modal isOpen={showCancellation} onClose={() => setShowCancellation(false)}>
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
              <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4 text-orange-600">Class Status</h2>
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
      
      {/* Auth Warning Modal */}
      <Modal isOpen={showAuthWarning} onClose={() => setShowAuthWarning(false)}>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Authentication Required</h2>
          <p className="mb-4">You must be logged in to enroll in a class. Please sign in first.</p>
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
