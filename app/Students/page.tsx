"use client";
import React, { useEffect, useState } from "react";
import StudentCourses from "../../components/StudentsCalendar/StudentCourses";
import StudentBookedClasses from "../../components/StudentsCalendar/StudentBookedClasses";  
import StudentCalendarView from "../../components/StudentsCalendar/StudentCalendarView";

interface Course {
  _id: string;
  title: string;
  length: number;
  price: number;
  instructorId: string;
}

interface TicketClass {
  _id: string;
  classId: string;
  instructorId: string;
  date: string;
  hour: string;
  type: string;
  duration: string;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  photo?: string;
}

const studentId = "67dda5c8448d12032b5d7a76"; // Alejandra (demo)

const StudentsDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [ticketClasses, setTicketClasses] = useState<TicketClass[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [instructorName, setInstructorName] = useState("");
  const [student, setStudent] = useState<Student | null>(null);

  // Fetch student info
  useEffect(() => {
    fetch(`/api/users/${studentId}`)
      .then(res => res.json())
      .then(setStudent);
  }, []);

  // Fetch student's ticketclasses and course info
  useEffect(() => {
    setLoading(true);
    fetch(`/api/students?studentId=${studentId}`)
      .then(res => res.json())
      .then(({ ticketclasses, courses }) => {
        setTicketClasses(ticketclasses);
        const classIds = new Set(ticketclasses.map((tc: any) => tc.classId.toString()));
        const filteredCourses = (courses || []).filter((c: any) => classIds.has(c._id.toString()))
          .map((c: any) => {
            const ticket = ticketclasses.find((tc: any) => tc.classId.toString() === c._id.toString());
            return { ...c, instructorId: ticket?.instructorId?.toString() };
          });
        setCourses(filteredCourses);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch instructor schedule when a course is selected
  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    fetch(`/api/instructors/${selectedCourse.instructorId}`)
      .then(res => res.json())
      .then(data => {
        // data puede ser un objeto
        const instructor = data;
        setInstructorName(instructor?.name || "");
        // Tomar el schedule y filtrar solo los slots libres
        const freeSchedule = (instructor?.schedule || []).map((day: any) => ({
          ...day,
          slots: (day.slots || []).filter((slot: any) => slot.status === "free" || slot.status === "Free")
        })).filter((day: any) => day.slots.length > 0);
        setSchedule(freeSchedule);
      })
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1]">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-16 w-16 text-[#0056b3] mb-4" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" stroke="#0056b3" strokeWidth="6" opacity="0.2" />
            <path d="M32 8a24 24 0 1 1 0 48a24 24 0 1 1 0-48zm0 0v12m0 24v12m-17-17h12m24 0h12M16.93 16.93l8.49 8.49m12.12 12.12l8.49 8.49M16.93 47.07l8.49-8.49m12.12-12.12l8.49-8.49" stroke="#0056b3" strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="32" r="6" fill="#0056b3" />
          </svg>
          <span className="text-[#0056b3] text-lg font-semibold">Loading...</span>
        </div>
      </div>
    );
  }

  // Header with student info
  const header = (
    <div className="flex items-center justify-start w-full px-8 py-4">
      {student && (
        <div className="flex items-center gap-3">
          <img
            src={student.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(student.firstName + " " + student.lastName)}
            alt={student.firstName}
            className="w-12 h-12 rounded-full border-2 border-[#0056b3] bg-white object-cover"
          />
          <span className="font-bold text-[#0056b3] text-lg">{student.firstName} {student.lastName}</span>
        </div>
      )}
    </div>
  );

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] py-8 px-4 flex flex-col items-center">
        {header}
        <div className="max-w-2xl w-full mt-12">
          <h1 className="text-3xl font-bold mb-10 text-[#0056b3] text-center">My Courses</h1>
          <StudentCourses courses={courses} onSelect={setSelectedCourse} />
        </div>
        <div className="max-w-2xl w-full mt-12">
          <h2 className="text-2xl font-bold mb-4 text-[#0056b3] text-center">My Booked Classes</h2>
          <StudentBookedClasses ticketClasses={ticketClasses} />
        </div>
      </div>
    );
  }

  // TODO: Show instructor's schedule and allow booking free slots
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] py-8 px-4 flex flex-col items-center">
      {header}
      <div className="max-w-5xl w-full mt-12 flex flex-col items-center">
        <button
          className="mb-6 px-4 py-2 rounded bg-[#0056b3] text-white font-semibold shadow hover:bg-[#003366] transition-all"
          onClick={() => setSelectedCourse(null)}
        >
          ← Back to My Courses
        </button>
        <h1 className="text-3xl font-bold mb-6 text-[#0056b3] text-center">{selectedCourse.title}</h1>
        <h2 className="text-xl font-semibold mb-4 text-[#27ae60] text-center">
          Instructor: <span className="text-[#0056b3]">{instructorName || 'Loading...'}</span>
        </h2>
        {/* Mostrar solo los espacios libres del instructor */}
        <div className="mt-8 w-full flex justify-center">
          <div className="w-full max-w-4xl">
            <StudentCalendarView schedule={schedule} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsDashboard;
