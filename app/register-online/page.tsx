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
  students: {
    studentId: string;
    reason?: string;
    citation_number?: string;
    citation_ticket?: string;
    course_country?: string;
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

export default function RegisterOnlinePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedClassType, setSelectedClassType] = useState<string>("ALL");
  const [weekOffset, setWeekOffset] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTicketClass, setSelectedTicketClass] = useState<TicketClass | null>(null);
  const [showUnbookConfirm, setShowUnbookConfirm] = useState(false);
  const [classToUnbook, setClassToUnbook] = useState<TicketClass | null>(null);

  const { user } = useAuth();
  const userId = user?._id || "";

  const classTypes = ["ALL", "A.D.I", "B.D.I", "D.A.T.E"];

  // Use SSE hook for real-time updates
  const { ticketClasses, isLoading, error: sseError, isConnected } = useRegisterOnlineSSE(selectedInstructorId, selectedClassType);

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
        const instructorsRes = await fetch('/api/instructors');
        if (instructorsRes.ok) {
          const instructorsData = await instructorsRes.json();
          setInstructors(instructorsData);
        }
      } catch (error) {
        console.error('❌ Error fetching instructors:', error);
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
    const weekDates = getWeekDates(selectedDate || new Date());
    
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
      <div className="overflow-x-auto w-full mt-6">
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
                  const dateString = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
                  
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
                      
                      const isAvailable = overlappingClass.status === 'available' && overlappingClass.availableSpots > 0;
                      
                      // Check if current user is enrolled in this class
                      const isUserEnrolled = overlappingClass.students.some(
                        (student: any) =>
                          (typeof student === 'string' || typeof student === 'object' && student.toString && !student.studentId)
                            ? student.toString() === userId
                            : student.studentId === userId || student.studentId?.toString() === userId
                      );
                      
                      // User is enrolled - show blue slot with unbook option
                      const enrolledCount = Array.isArray(overlappingClass.students)
                        ? overlappingClass.students.length
                        : 0;
                      if (isUserEnrolled) {
                        return (
                          <td
                            key={date.toDateString()}
                            className="border border-gray-300 p-1 cursor-pointer min-w-[80px] w-[80px] bg-blue-500 text-white hover:bg-red-500"
                            rowSpan={rowSpan}
                            onClick={() => {
                              setClassToUnbook(overlappingClass);
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
                            <div className="text-xs">
                              {overlappingClass.hour}-{overlappingClass.endHour}
                            </div>
                            <div className="text-xs">
                              {enrolledCount}/{overlappingClass.totalSpots}
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
                              setSelectedTicketClass(overlappingClass);
                              setIsBookingModalOpen(true);
                            }}
                          >
                            <div className="text-xs text-black">
                              Available
                            </div>
                            <div className="text-xs font-bold text-black">
                              {overlappingClass.classInfo?.title || getClassTypeDisplay(overlappingClass.type)}
                            </div>
                            <div className="text-xs text-black">
                              {overlappingClass.hour}-{overlappingClass.endHour}
                            </div>
                            <div className="text-xs text-black">
                              {enrolledCount}/{overlappingClass.totalSpots}
                            </div>
                          </td>
                        );
                      }
                      
                      // Class is full
                      return (
                        <td
                          key={date.toDateString()}
                          className="border border-gray-300 p-1 min-w-[80px] w-[80px] bg-gray-100"
                          rowSpan={rowSpan}
                        >
                          <div className="text-xs text-black">
                            Full
                          </div>
                          <div className="text-xs font-bold text-black">
                            {overlappingClass.classInfo?.title || getClassTypeDisplay(overlappingClass.type)}
                          </div>
                          <div className="text-xs text-black">
                            {enrolledCount}/{overlappingClass.totalSpots}
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
        
        {/* Left Side - Calendar and Filters */}
        <div className="w-full lg:w-1/3 flex flex-col items-center mt-8 sm:mt-12">
          {/* Calendar */}
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
            <h3 className="text-lg font-semibold text-center mb-2 text-blue-600">Select Class Type</h3>
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

        {/* Right Side - Schedule Table */}
        <div className="w-full lg:w-2/3 mt-6 lg:mt-0">
          {selectedInstructorId && isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading {selectedClassType} classes schedule...</p>
            </div>
          )}
          
          {selectedInstructor && !isLoading && (
            <>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-4 mt-12">
                <span className="text-blue-700">{selectedInstructor.name}&apos;s </span>
                <span className="text-[#10B981]">{selectedClassType} Classes</span>
              </h2>
              <p className="text-center text-gray-600 mb-6 text-sm">
                Showing only {selectedClassType} appointments. Green slots are available for booking.
              </p>
              
              {(!ticketClasses || ticketClasses.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No {selectedClassType} classes available for this instructor.</p>
                  <p className="text-gray-400 text-sm mt-2">Please select another instructor or check back later.</p>
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
      
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => setShowLogin(false)}
      />
    </section>
  );
}
