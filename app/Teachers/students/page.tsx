"use client";
import React, { useEffect, useState } from 'react';
import StudentList from '@/components/Students/StudentList';
import StudentDetails from '@/components/Students/StudentDetails';
import MailModal from '@/components/Students/MailModal';
import { useSession } from "next-auth/react";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
}

interface ClassInfo {
  _id: string;
  date: string;
  hour: string;
  type: string;
  duration: string;
}

interface Course {
  _id: string;
  title: string;
  length: number;
  price: number;
}

interface ClassResponse {
  _id: string;
  date: string;
  hour: string;
  type: string;
  duration: string;
}

interface NoteResponse {
  notes: {
    _id: string;
    text: string;
    createdAt: string;
    instructorId: string;
    studentId: string;
  }[];
}

interface Note {
  text: string;
  date: string;
}

// Custom hook para polling tipo webhook
function useWebhook(instructorId: string | undefined, onUpdate: (data: unknown) => void) {
  React.useEffect(() => {
    if (!instructorId) return;
    const fetchAndUpdate = () => {
      fetch(`/api/teachers/classes?instructorId=${instructorId}`)
        .then(res => res.json())
        .then(onUpdate);
    };
    fetchAndUpdate();
    const interval = setInterval(fetchAndUpdate, 5000);
    return () => clearInterval(interval);
  }, [instructorId, onUpdate]);
}

const StudentsPage = () => {
  const { data: session } = useSession();
  const instructorId = (session?.user as { instructorId?: string })?.instructorId;
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Student | null>(null);
  const [history, setHistory] = useState<ClassInfo[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [notesHistory, setNotesHistory] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  // Modal correo
  const [showMailModal, setShowMailModal] = useState(false);
  const [mailRecipients, setMailRecipients] = useState<string[]>([]);
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [mailSending, setMailSending] = useState(false);
  const [mailSent, setMailSent] = useState(false);

  // Hook profesional para actualización en vivo
  useWebhook(
    instructorId,
    (data) => {
      const typedData = data as { classes?: Course[]; students?: Student[] };
      setCourses(typedData.classes || []);
      setStudents(typedData.students || []);
      setLoading(false);
    }
  );

  // 2. Cuando seleccionas un curso, limpiar selección de estudiante y notas
  useEffect(() => {
    setSelected(null);
    setHistory([]);
    setNotes('');
    setNotesHistory([]);
    setSaveMsg('');
  }, [selectedCourse]);

  // 3. Cuando seleccionas un estudiante, traer su historial en ese curso
  const handleSelect = async (student: Student) => {
    setSelected(student);
    setNotes('');
    setNotesHistory([]);
    setSaveMsg('');
    if (!selectedCourse || !instructorId) return;
    // Traer historial de clases
    const res = await fetch(`/api/ticketclasses?instructorId=${instructorId}&studentId=${student._id}&classId=${selectedCourse._id}`);
    const data = await res.json() as ClassResponse[];
    setHistory(data.map((c) => ({
      _id: c._id,
      date: c.date,
      hour: c.hour,
      type: c.type,
      duration: c.duration
    })));
    // Traer historial de notas
    const notesRes = await fetch(`/api/notes?studentId=${student._id}&instructorId=${instructorId}`);
    const notesData = await notesRes.json() as NoteResponse;
    const notesArr = notesData.notes.map(note => ({
      text: note.text,
      date: note.createdAt
    }));
    setNotesHistory(notesArr);
  };

  const filtered = students.filter(s =>
    s.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    s.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.dni?.toLowerCase().includes(search.toLowerCase()) ||
    s._id.includes(search)
  );

  const handleSaveNotes = async () => {
    if (!selected || !instructorId) return;
    setSaving(true);
    setSaveMsg('');
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: selected._id, instructorId, text: notes })
    });
    if (res.ok) {
      setSaveMsg('Notes saved!');
      setNotes('');
      // Refrescar historial de notas
      const notesData = await res.json() as NoteResponse;
      const notesArr = notesData.notes.map(note => ({
        text: note.text,
        date: note.createdAt
      }));
      setNotesHistory(notesArr);
    } else {
      setSaveMsg('Error saving notes');
    }
    setSaving(false);
  };

  // Función para abrir modal de correo masivo
  const handleOpenMassMail = () => {
    setMailRecipients(students.map(s => s.email));
    setMailSubject('');
    setMailBody('');
    setMailSent(false);
    setShowMailModal(true);
  };
  // Función para abrir modal de correo individual
  const handleOpenSingleMail = (email: string) => {
    setMailRecipients([email]);
    setMailSubject('');
    setMailBody('');
    setMailSent(false);
    setShowMailModal(true);
  };
  // Simular envío de correo
  const handleSendMail = async () => {
    setMailSending(true);
    setMailSent(false);
    try {
      const res = await fetch('/api/send_gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: mailRecipients,
          subject: mailSubject,
          body: mailBody
        })
      });
      if (res.ok) {
        setMailSent(true);
      } else {
        setMailSent(false);
        alert('Error sending email');
      }
    } catch {
      setMailSent(false);
      alert('Error sending email');
    }
    setMailSending(false);
  };

  // Pantalla 1: My Classes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1]">
        <div className="flex flex-col items-center">
          {/* SVG volante animado */}
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

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] py-8 px-4 flex flex-col items-center">
        <div className="max-w-2xl w-full mt-32">
          <h1 className="text-3xl font-bold mb-10 text-[#0056b3] text-center">My Classes</h1>
          <div className="flex flex-col gap-6 items-center">
            {courses.map(course => (
              <div
                key={course._id}
                className="w-full max-w-xl cursor-pointer p-6 rounded-2xl shadow-2xl border border-[#e0e0e0] bg-white hover:bg-blue-50 transition-all duration-200 text-center"
                onClick={() => setSelectedCourse(course)}
              >
                <div className="font-bold text-xl text-[#0056b3] mb-2">{course.title}</div>
                <div className="text-md text-gray-500">{course.length}h - ${course.price}</div>
              </div>
            ))}
            {courses.length === 0 && <div className="text-gray-400">No courses found</div>}
          </div>
        </div>
      </div>
    );
  }

  // Pantalla 2: Students in [Course]
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] py-8 px-4 flex flex-col items-center">
      <div className="max-w-5xl w-full mt-32">
        <button
          className="mb-6 px-4 py-2 rounded bg-[#0056b3] text-white font-semibold shadow hover:bg-[#003366] transition-all"
          onClick={() => { setSelectedCourse(null); setSelected(null); setSearch(''); }}
        >
          ← Back to My Classes
        </button>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold mb-0 text-[#0056b3] text-center flex-1">Students in <span className="text-[#27ae60]">{selectedCourse.title}</span></h1>
          <button
            className="ml-4 flex items-center gap-2 bg-white border border-[#ea4335] text-[#ea4335] px-4 py-2 rounded-full shadow hover:bg-[#ea4335] hover:text-white transition-all text-lg font-bold"
            title="Send email to all students"
            onClick={handleOpenMassMail}
          >
            <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="24" fill="#fff"/>
              <path d="M8 16l16 12 16-12" stroke="#ea4335" strokeWidth="3" strokeLinejoin="round"/>
              <rect x="8" y="16" width="32" height="16" rx="3" stroke="#ea4335" strokeWidth="3"/>
            </svg>
            <span className="hidden md:inline">Email All</span>
          </button>
        </div>
        <div className="flex gap-8">
          <StudentList
            filtered={filtered}
            search={search}
            setSearch={setSearch}
            handleSelect={handleSelect}
            handleOpenSingleMail={handleOpenSingleMail}
            loadingStudents={false}
          />
          <main className="flex-1 bg-white rounded-3xl shadow-2xl p-6 border border-[#e0e0e0]">
            <StudentDetails
              selected={selected}
              history={history}
              notesHistory={notesHistory}
              notes={notes}
              setNotes={setNotes}
              handleSaveNotes={handleSaveNotes}
              saving={saving}
              saveMsg={saveMsg}
            />
          </main>
        </div>
      </div>
      <MailModal
        show={showMailModal}
        onClose={() => setShowMailModal(false)}
        recipients={mailRecipients}
        subject={mailSubject}
        setSubject={setMailSubject}
        body={mailBody}
        setBody={setMailBody}
        sending={mailSending}
        sent={mailSent}
        onSend={handleSendMail}
      />
    </div>
  );
};

export default StudentsPage; 