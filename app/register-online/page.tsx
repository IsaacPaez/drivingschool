"use client";

import React, { useState, useEffect, Suspense } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/globals.css";
import Modal from "@/components/Modal";
import { useAuth } from "@/components/AuthContext";
import LoginModal from "@/components/LoginModal";
import { useSearchParams } from "next/navigation";
import useRegisterOnlineSSE from "@/hooks/useRegisterOnlineSSE";

interface Instructor {
  _id: string;
  name: string;
  photo?: string;
}

interface TicketClass {
  _id: string;
  type: string;
  hour: string;
  endHour: string;
  duration: string;
  date: string;
  cupos: number;
  status: string;
  availableSpots: number;
  enrolledStudents: number;
  totalSpots: number;
  userHasPendingRequest?: boolean;
  userIsEnrolled?: boolean;
  students: {
    studentId: string;
    reason?: string;
    citation_number?: string;
    citation_ticket?: string;
    course_country?: string;
  }[];
  studentRequests?: {
    studentId: string;
    requestDate: string;
    status: 'pending' | 'accepted' | 'rejected';
  }[];
  classInfo?: {
    _id: string;
    title: string;
    overview: string;
  };
  instructorInfo?: {
    _id: string;
    name: string;
    email: string;
    photo: string;
  };
}

// Component that uses useSearchParams
function RegisterOnlineContent() {
  const searchParams = useSearchParams();
  const classId = searchParams?.get('classId') || null;
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [classList, setClassList] = useState<{_id: string; title: string}[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(classId);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTicketClass, setSelectedTicketClass] = useState<TicketClass | null>(null);
  const [showUnbookConfirm, setShowUnbookConfirm] = useState(false);
  const [classToUnbook, setClassToUnbook] = useState<TicketClass | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestedTicketClass, setRequestedTicketClass] = useState<TicketClass | null>(null);

  const { user } = useAuth();
  const userId = user?._id || "";

  // Use SSE hook for real-time updates with selectedClassId and userId
  const { ticketClasses, isLoading } = useRegisterOnlineSSE(selectedInstructorId, selectedClassId, userId);

  // Effect to handle classId from URL - automatically show calendar if classId is present
  useEffect(() => {
    if (classId) {
      // If we have a classId, we don't need to select instructor manually
      // The calendar should show all instructors' classes for this specific class type
      setSelectedInstructorId("ALL");
      setSelectedClassId(classId);
    }
  }, [classId]);

  // Helper functions
  const pad = (n: number) => n.toString().padStart(2, '0');

  const handleDateChange = (value: Date | Date[] | null) => {
    if (!value || Array.isArray(value)) return;
    setSelectedDate(value);
  };

  const handleEnrollClass = async () => {
    if (!selectedTicketClass || !userId) {
      if (!userId) {
        setShowAuthWarning(true);
      }
      return;
    }

    try {
      const response = await fetch('/api/register-online/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketClassId: selectedTicketClass._id,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setConfirmationMessage(`Successfully enrolled in ${selectedTicketClass.classInfo?.title || 'the class'}!`);
        setShowConfirmation(true);
        setIsBookingModalOpen(false);
        setSelectedTicketClass(null);
        // The SSE will automatically update the UI with new enrollment data
      } else {
        setConfirmationMessage(data.error || 'Failed to enroll in class');
        setShowConfirmation(true);
        setIsBookingModalOpen(false);
      }
    } catch (error) {
      console.error('Error enrolling in class:', error);
      setConfirmationMessage('An error occurred while enrolling');
      setShowConfirmation(true);
      setIsBookingModalOpen(false);
    }
  };

  const handleRequestClass = async (ticketClass: TicketClass) => {
    if (!userId) {
      setShowAuthWarning(true);
      return;
    }

    try {
      const response = await fetch('/api/register-online/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketClassId: ticketClass._id,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show custom modal with phone number and cancel option
        setRequestedTicketClass(ticketClass);
        setShowRequestModal(true);
        // The SSE will automatically update the UI with new request data
      } else {
        setConfirmationMessage(data.error || 'Failed to send request');
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error('Error sending class request:', error);
      setConfirmationMessage('An error occurred while sending request');
      setShowConfirmation(true);
    }
  };

  const handleUnbookClass = async () => {
    if (!classToUnbook || !userId) {
      return;
    }

    try {
      const response = await fetch('/api/register-online/unbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketClassId: classToUnbook._id,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setConfirmationMessage(`Successfully unenrolled from ${classToUnbook.classInfo?.title || 'the class'}!`);
        setShowConfirmation(true);
        setShowUnbookConfirm(false);
        setClassToUnbook(null);
        // The SSE will automatically update the UI with new enrollment data
      } else {
        setConfirmationMessage(data.error || 'Failed to unenroll from class');
        setShowConfirmation(true);
        setShowUnbookConfirm(false);
      }
    } catch (error) {
      console.error('Error unenrolling from class:', error);
      setConfirmationMessage('An error occurred while unenrolling');
      setShowConfirmation(true);
      setShowUnbookConfirm(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!requestedTicketClass || !userId) {
      return;
    }

    try {
      const response = await fetch('/api/register-online/cancel-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketClassId: requestedTicketClass._id,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowRequestModal(false);
        setRequestedTicketClass(null);
        setConfirmationMessage('Request cancelled successfully');
        setShowConfirmation(true);
        // The SSE will automatically update the UI
      } else {
        setConfirmationMessage(data.error || 'Failed to cancel request');
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      setConfirmationMessage('An error occurred while cancelling request');
      setShowConfirmation(true);
    }
  };

  const getWeekDates = () => {
    // Start from today's week, then add weekOffset
    const today = new Date();
    const base = new Date(today);
    base.setDate(today.getDate() + weekOffset * 7);
    
    // Get the start of that week (Sunday)
    const startOfWeek = new Date(base);
    startOfWeek.setDate(base.getDate() - base.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const getClassTypeDisplay = (type: string): string => {
    switch (type) {
      case 'A.D.I': return 'A.D.I';
      case 'B.D.I': return 'B.D.I';
      case 'D.A.T.E': return 'D.A.T.E';
      default: return type;
    }
  };

  const formatTime = (time: string): string => {
    if (!time) return '';
    return time;
  };

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

        // Fetch classes
        const classesRes = await fetch('/api/classes');
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClassList(classesData);
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Update selected instructor when instructor ID changes
  useEffect(() => {
    if (selectedInstructorId && instructors.length > 0) {
      const instructor = instructors.find(inst => inst._id === selectedInstructorId);
      setSelectedInstructor(instructor || null);
    } else {
      setSelectedInstructor(null);
    }
  }, [selectedInstructorId, instructors]);

  // Render schedule table (similar to Book Now but for classes)
  const renderScheduleTable = () => {
    const weekDates = getWeekDates();
    
    // Generate 30-minute time blocks from 6:00 to 19:30
    const allTimes: { start: string, end: string }[] = [];
    for (let h = 6; h < 20; h++) {
      allTimes.push({ start: `${pad(h)}:00`, end: `${pad(h)}:30` });
      allTimes.push({ start: `${pad(h)}:30`, end: `${pad(h+1)}:00` });
    }

    // Helper function to convert time to minutes for comparison
    const timeToMinutes = (time: string): number => {
      if (!time || typeof time !== 'string') return 0;
      const [hours, minutes] = time.split(':').map(Number);
      return (hours || 0) * 60 + (minutes || 0);
    };

    // Helper function to check if a time block overlaps with a class
    const doesBlockOverlapWithClass = (blockStart: string, blockEnd: string, classStart: string, classEnd: string): boolean => {
      const blockStartMin = timeToMinutes(blockStart);
      const blockEndMin = timeToMinutes(blockEnd);
      const classStartMin = timeToMinutes(classStart);
      const classEndMin = timeToMinutes(classEnd);
      
      return blockStartMin < classEndMin && blockEndMin > classStartMin;
    };

    // Helper function to check if this is the first block of a class
    const isFirstBlockOfClass = (blockStart: string, classStart: string): boolean => {
      return timeToMinutes(blockStart) === timeToMinutes(classStart);
    };

    return (
      <div id="schedule-table" className="overflow-x-auto w-full mt-6">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-white text-center">
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
            {allTimes.map((timeBlock, index) => (
              <tr key={index} className="text-center">
                <td className="border border-gray-300 p-1 font-bold text-black min-w-[70px] w-[70px] text-xs">
                  {timeBlock.start}-{timeBlock.end}
                </td>
                {weekDates.map((date) => {
                  // Find classes for this date
                  const classesForDate = ticketClasses.filter(tc => {
                    if (!tc.date) return false;
                    // Fuerza coincidencia exacta por string YYYY-MM-DD
                    const tcDateString = tc.date.length >= 10 ? tc.date.slice(0, 10) : '';
                    const calendarDateString = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    return tcDateString === calendarDateString;
                  });
                  
                  // Find class that overlaps with this time block
                  const overlappingClass = classesForDate.find(tc => 
                    tc.hour && tc.endHour && 
                    doesBlockOverlapWithClass(timeBlock.start, timeBlock.end, tc.hour, tc.endHour)
                  );
                  
                  if (overlappingClass) {
                    // Check if this is the first block of the class
                    if (isFirstBlockOfClass(timeBlock.start, overlappingClass.hour)) {
                      // Calculate how many 30-minute blocks this class spans
                      const classStartMin = timeToMinutes(overlappingClass.hour);
                      const classEndMin = timeToMinutes(overlappingClass.endHour);
                      const classDurationMin = classEndMin - classStartMin;
                      const rowSpan = Math.ceil(classDurationMin / 30);
                      
                      // FORCE AVAILABLE: Si hay spots disponibles, la clase DEBE estar disponible
                      const hasAvailableSpots = overlappingClass.availableSpots > 0;
                      const isAvailable = hasAvailableSpots || overlappingClass.status === 'available';
                      
                      // Check if current user is enrolled in this class
                      const isUserEnrolled = overlappingClass.students.some(
                        (student: string | { studentId?: string }) =>
                          (typeof student === 'string')
                            ? student === userId
                            : student.studentId === userId || student.studentId?.toString() === userId
                      );

                      // Check if current user has a pending request
                      const hasPendingRequest = overlappingClass.userHasPendingRequest;
                      
                      // User is enrolled - show blue slot with unbook option
                      if (isUserEnrolled) {
                        return (
                          <td
                            key={date.toDateString()}
                            className="border border-gray-300 p-1 cursor-pointer min-w-[80px] w-[80px] bg-blue-500 text-white hover:bg-red-500"
                            rowSpan={rowSpan}
                            onClick={() => {
                              setClassToUnbook(overlappingClass as TicketClass);
                              setShowUnbookConfirm(true);
                            }}
                            title="Click to unenroll from this class"
                          >
                            <div className="text-xs">
                              Enrolled
                            </div>
                            <div className="text-xs font-bold">
                              {overlappingClass.classInfo?.title || getClassTypeDisplay(overlappingClass.type)}
                            </div>
                          </td>
                        );
                      }
                      
                      // User has pending request - show yellow slot with click to cancel
                      if (hasPendingRequest) {
                        return (
                          <td
                            key={date.toDateString()}
                            className="border border-gray-300 p-1 cursor-pointer min-w-[80px] w-[80px] bg-yellow-100 hover:bg-yellow-200 text-black"
                            rowSpan={rowSpan}
                            title="Click to cancel your pending request"
                            onClick={() => {
                              if (!userId) {
                                setShowAuthWarning(true);
                                return;
                              }
                              // Show the request modal to allow cancellation
                              setRequestedTicketClass(overlappingClass as TicketClass);
                              setShowRequestModal(true);
                            }}
                          >
                            <div className="text-xs">
                              Pending
                            </div>
                            <div className="text-xs font-bold">
                              {overlappingClass.classInfo?.title || getClassTypeDisplay(overlappingClass.type)}
                            </div>
                          </td>
                        );
                      }
                      
                      // Class is available for enrollment
                      if (isAvailable) {
                        return (
                          <td
                            key={date.toDateString()}
                            className="border border-gray-300 p-1 cursor-pointer min-w-[80px] w-[80px] bg-green-100 hover:bg-green-200"
                            rowSpan={rowSpan}
                            onClick={() => {
                              if (!userId) {
                                setShowAuthWarning(true);
                                return;
                              }
                              // Instead of opening modal, send request directly
                              handleRequestClass(overlappingClass as TicketClass);
                            }}
                          >
                            <div className="text-xs text-black">
                              Available
                            </div>
                            <div className="text-xs font-bold text-black">
                              {overlappingClass.classInfo?.title || getClassTypeDisplay(overlappingClass.type)}
                            </div>
                          </td>
                        );
                      }
                      
                      // Class is not available (occupied by other students or not available)
                      return (
                        <td
                          key={date.toDateString()}
                          className="border border-gray-300 p-1 min-w-[80px] w-[80px] bg-gray-100"
                          rowSpan={rowSpan}
                        >
                          <div className="text-xs text-black">
                            Occupied
                          </div>
                          <div className="text-xs font-bold text-black">
                            {overlappingClass.classInfo?.title || getClassTypeDisplay(overlappingClass.type)}
                          </div>
                        </td>
                      );
                    } else {
                      // This row is covered by the rowSpan from above, skip it
                      return null;
                    }
                  } else {
                    // No class in this time slot
                    return (
                      <td
                        key={date.toDateString()}
                        className="border border-gray-300 py-1 bg-white text-black min-w-[80px] w-[80px]"
                      >
                        -
                      </td>
                    );
                  }
                })}
              </tr>
            )).filter(row => row !== null)}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section className="bg-white pt-32 pb-8 px-2 sm:px-6 flex flex-col items-center w-full">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Side - Calendar and Class Types */}
        <div className="w-full lg:w-1/3 flex flex-col items-center mt-8 sm:mt-12">
          
          {/* Calendar Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 text-gray-800">
            Select Date
          </h2>
          
          {/* Calendar */}
          <div className="mb-4 w-full flex justify-center">
            <Calendar
              onChange={(value) => handleDateChange(value as Date | null)}
              value={selectedDate}
              locale="en-US"
              className="border rounded-lg shadow-md w-full max-w-xs p-2"
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

          {/* Available Ticket Classes Title */}
          <h3 className="text-lg sm:text-xl font-semibold text-center mb-4 text-gray-700">
            Available Ticket Classes
          </h3>

          {/* Class Types Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 w-full">
            {classList.map((cls) => {
              return (
                <div
                  key={cls._id}
                  className={`shadow-lg rounded-xl p-3 sm:p-4 text-center cursor-pointer hover:shadow-xl transition-all w-full ${selectedClassId === cls._id ? "border-4 border-blue-500 bg-blue-100" : "bg-white"}`}
                  onClick={() => {
                    setSelectedClassId(cls._id);
                    setSelectedInstructorId("ALL"); // Show all instructors for this class
                  }}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-sm sm:text-md font-semibold text-black text-center leading-tight">{cls.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side - Schedule Table */}
        <div className="w-full lg:w-2/3 mt-6 lg:mt-0">
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading classes schedule...</p>
            </div>
          )}
          
          {/* Show schedule when we have selected class */}
          {selectedClassId && !isLoading && (
            <>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-4 mt-12">
                <span className="text-[#10B981]">Available Classes</span>
              </h2>
              <p className="text-center text-gray-600 mb-6 text-sm">
                Green slots are available for booking.
              </p>
              
              {(!ticketClasses || ticketClasses.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No classes available for this class type.</p>
                  <p className="text-gray-400 text-sm mt-2">Please check back later.</p>
                </div>
              )}
              
              {ticketClasses && ticketClasses.length > 0 && (
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

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      >
        <div className="p-6 text-black">
          <h2 className="text-xl font-bold mb-4">Enroll in Class</h2>
          {selectedTicketClass && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="mb-2"><strong>Class Type:</strong> {getClassTypeDisplay(selectedTicketClass.type)}</p>
                <p className="mb-2"><strong>Date:</strong> {new Date(selectedTicketClass.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p className="mb-2"><strong>Time:</strong> {formatTime(selectedTicketClass.hour)} - {formatTime(selectedTicketClass.endHour)}</p>
                <p className="mb-2"><strong>Duration:</strong> {selectedTicketClass.duration}</p>
                <p className="mb-2"><strong>Enrolled Students:</strong> {selectedTicketClass.enrolledStudents}/{selectedTicketClass.totalSpots}</p>
                <p className="mb-2"><strong>Instructor:</strong> {selectedInstructor?.name}</p>
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
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
              onClick={handleEnrollClass}
            >
              {isLoading ? 'Enrolling...' : 'Confirm Enrollment'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4 text-green-600">Enrollment Status</h2>
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

      {/* Unbook Confirmation Modal */}
      <Modal isOpen={showUnbookConfirm} onClose={() => setShowUnbookConfirm(false)}>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Unenroll from Class</h2>
          {classToUnbook && (
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <p className="mb-2"><strong>Class:</strong> {classToUnbook.classInfo?.title || getClassTypeDisplay(classToUnbook.type)}</p>
              <p className="mb-2"><strong>Date:</strong> {new Date(classToUnbook.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p className="mb-2"><strong>Time:</strong> {formatTime(classToUnbook.hour)} - {formatTime(classToUnbook.endHour)}</p>
            </div>
          )}
          <p className="mb-4 text-gray-700">Are you sure you want to unenroll from this class?</p>
          <div className="flex justify-center gap-3">
            <button
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              onClick={() => setShowUnbookConfirm(false)}
            >
              Cancel
            </button>
            <button
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
              onClick={handleUnbookClass}
            >
              Unenroll
            </button>
          </div>
        </div>
      </Modal>

      {/* Request Confirmation Modal */}
      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)}>
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4 text-green-600">Request Submitted Successfully!</h2>
          </div>
          
          {requestedTicketClass && (
            <div className="bg-green-50 p-4 rounded-lg mb-4 text-left">
              <p className="mb-2"><strong>Class:</strong> {requestedTicketClass.classInfo?.title || getClassTypeDisplay(requestedTicketClass.type)}</p>
              <p className="mb-2"><strong>Date:</strong> {new Date(requestedTicketClass.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p className="mb-2"><strong>Time:</strong> {formatTime(requestedTicketClass.hour)} - {formatTime(requestedTicketClass.endHour)}</p>
            </div>
          )}
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-800 font-medium mb-2">To complete the enrollment process, please contact:</p>
            <p className="text-2xl font-bold text-blue-900">(561) 330-7007</p>
          </div>
          
          <p className="text-gray-600 mb-6">Your request is now pending approval. Our team will contact you soon to finalize your enrollment.</p>
          
          <div className="flex justify-center gap-3">
            <button
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
              onClick={handleCancelRequest}
            >
              Cancel Request
            </button>
            <button
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
              onClick={() => setShowRequestModal(false)}
            >
              OK
            </button>
          </div>
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

// Main component with Suspense wrapper
export default function RegisterOnlinePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RegisterOnlineContent />
    </Suspense>
  );
}
