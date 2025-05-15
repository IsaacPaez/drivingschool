'use client';
import React, { useState, useEffect } from 'react';
import CalendarGrid from './CalendarGrid';
import CalendarToolbar from './CalendarToolbar';
import Modal from '../Modal';
import dynamic from 'next/dynamic';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const MiniCalendar = dynamic(() => import('./MiniCalendar'), { ssr: false });

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

interface MongoDBObjectId {
  $oid: string;
}

interface TimeSlot {
  start: string;
  end: string;
  status?: 'scheduled' | 'cancelled' | 'free' | 'canceled';
  _id?: string | MongoDBObjectId;
  studentId?: string | MongoDBObjectId;
}

interface Class {
  id: string;
  date: Date;
  hour: number;
  status: 'scheduled' | 'cancelled' | 'free';
  studentId?: string | MongoDBObjectId;
  instructorId?: string | MongoDBObjectId;
  slots?: TimeSlot[];
  start?: string;
  end?: string;
  day?: number;
}

interface CalendarViewProps {
  classes: Class[];
  onClassClick: (classData: Class) => void;
  onScheduleUpdate?: () => void;
  hideSidebars?: boolean;
}

interface CalendarGridProps {
  view: 'week' | 'month';
  onTimeBlockClick: (block: Class) => void;
  selectedDate: Date;
  classes: Class[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ classes: initialClasses, onClassClick, onScheduleUpdate, hideSidebars }) => {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Class | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDate, setAddDate] = useState<Date | null>(null);
  const [addHour, setAddHour] = useState<number | null>(null);
  const [classFilter, setClassFilter] = useState<'scheduled' | 'cancelled' | 'free'>('scheduled');
  const [studentInfo, setStudentInfo] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const adapted = (initialClasses || []).flatMap((item: Class) =>
      (item.slots || []).map((slot: TimeSlot) => ({
        id: slot && slot._id && typeof slot._id === 'object' && '$oid' in slot._id
          ? String(slot._id.$oid)
          : slot && slot._id
            ? String(slot._id)
            : '',
        date: new Date(item.date),
        hour: parseInt(slot.start.split(':')[0], 10),
        status: (slot.status === 'canceled' ? 'cancelled' : slot.status || 'free') as Class['status'],
        studentId:
          slot && slot.studentId && typeof slot.studentId === 'object' && '$oid' in slot.studentId
            ? String(slot.studentId.$oid)
            : slot && slot.studentId
              ? String(slot.studentId)
              : undefined,
        instructorId: typeof item.instructorId === 'object' ? item.instructorId.$oid : item.instructorId,
        start: slot.start,
        end: slot.end
      }))
    );
    setClasses(adapted);
  }, [initialClasses]);

  useEffect(() => {
  }, [classes]);

  // Nuevo: buscar info del estudiante cuando se selecciona un bloque
  useEffect(() => {
    if (selectedBlock && selectedBlock.studentId) {
      const id = typeof selectedBlock.studentId === 'object' && selectedBlock.studentId.$oid
        ? selectedBlock.studentId.$oid
        : selectedBlock.studentId.toString();
      fetch(`/api/users/${id}`)
        .then(res => res.json())
        .then(data => {
          setStudentInfo({ name: data.firstName + ' ' + (data.lastName || ''), email: data.email });
        })
        .catch(() => setStudentInfo(null));
    } else {
      setStudentInfo(null);
    }
  }, [selectedBlock]);

  // Navegación entre semanas/meses
  const handlePrev = () => {
    if (view === 'week') setSelectedDate(addDays(selectedDate, -7));
    else setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };
  const handleNext = () => {
    if (view === 'week') setSelectedDate(addDays(selectedDate, 7));
    else setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  // Sincroniza selección de fecha
  const handleMiniCalendarChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Permitir click solo para mostrar info
  const handleTimeBlockClick = (block: Class) => {
    if (block.status === 'scheduled') {
      setSelectedBlock(block);
      setModalOpen(true);
    }
    onClassClick(block);
  };

  const handleAddClass = async () => {
    if (!addDate || addHour === null) return;
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: '67dda5c8448d12032b5d7a76', // TODO: Usar el id real del estudiante logueado
          instructorId: selectedBlock?.instructorId || '681c2566f4e0eb5564f85205', // TODO: Usar el id real del instructor
          date: addDate.toISOString().split('T')[0],
          start: `${addHour.toString().padStart(2, '0')}:00`,
          end: `${(addHour + 1).toString().padStart(2, '0')}:00`,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        if (onScheduleUpdate) await onScheduleUpdate();
      } else {
        alert('This slot is no longer available.');
      }
    } catch (error) {
      alert('Error booking the class');
    }
  };

  // Guardar/agendar clase
  const handleSaveClass = (updatedClass: Class) => {
    if (!selectedBlock) return;
    setClasses(prev => prev.map(c =>
      c.id === selectedBlock.id ? { ...c, ...updatedClass } : c
    ));
  };

  // Eliminar clase
  const handleDeleteClass = () => {
    if (!selectedBlock) return;
    setClasses((prev) => prev.filter((c) => {
      if (view === 'week') {
        return !(c.date.toDateString() === selectedDate.toDateString() && c.hour === selectedBlock.hour);
      } else {
        return !(c.date.getDate() === selectedBlock.day && c.date.getMonth() === selectedDate.getMonth());
      }
    }));
    setModalOpen(false);
  };

  const getVisibleDates = () => {
    if (view === 'week') {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - ((startOfWeek.getDay() + 6) % 7));
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        d.setHours(0,0,0,0);
        return d;
      });
    } else {
      // Mes completo
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: lastDay }, (_, i) => {
        const d = new Date(year, month, i + 1);
        d.setHours(0,0,0,0);
        return d;
      });
    }
  };

  const visibleDates = getVisibleDates();
  const filteredClasses = classes.filter(c => {
    // Estado
    let status = c.status;
    if (String(status) === 'canceled' || String(status) === 'cancelled') status = 'cancelled';
    if (status === 'scheduled' && classFilter !== 'scheduled') return false;
    if (status === 'cancelled' && classFilter !== 'cancelled') return false;
    if (status === 'free' && classFilter !== 'free') return false;
    // Fecha visible
    return visibleDates.some(d => d.toDateString() === new Date(c.date).toDateString());
  });

  const grouped = filteredClasses.reduce((acc, c) => {
    const dateKey = new Date(c.date).toLocaleDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(c.hour);
    return acc;
  }, {} as Record<string, number[]>);

  const renderClassList = () => {
    if (Object.keys(grouped).length === 0) return <li className="text-gray-400">Not available</li>;
    return Object.entries(grouped).sort((a, b) => {
      // Ordenar por fecha ascendente
      const da = new Date(a[0].split('/').reverse().join('-'));
      const db = new Date(b[0].split('/').reverse().join('-'));
      return da.getTime() - db.getTime();
    }).map(([date, hours], idx) => {
      // Agrupar horas consecutivas en rangos
      const sorted = (hours as number[]).sort((a, b) => a - b);
      const ranges: [number, number][] = [];
      let start = sorted[0], end = sorted[0];
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === end + 1) {
          end = sorted[i];
        } else {
          ranges.push([start, end]);
          start = end = sorted[i];
        }
      }
      ranges.push([start, end]);
      return (
        <li key={date + idx} className="mb-1">
          <span className="font-bold text-[#0056b3]">{date}</span>{' '}
          {ranges.map(([s, e], i) => (
            <span key={i} className="inline-block bg-gray-200 rounded px-1 mx-1">
              {s.toString().padStart(2, '0')}:00 - {(e+1).toString().padStart(2, '0')}:00
            </span>
          ))}
        </li>
      );
    });
  };

  // Generar bloques de 30 minutos desde las 6:00 hasta las 20:00 para cada día visible
  const slotStartHour = 6;
  const slotEndHour = 20;
  const timeSlots: string[] = [];
  for (let h = slotStartHour; h < slotEndHour; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  // Para cada día visible, generar los bloques de 30 minutos
  const blocks: { id: string; time: string; status: 'booked' | 'available' | 'unavailable' | 'cancelled'; date: Date; hour: number; minute: number }[] = [];
  visibleDates.forEach((date) => {
    timeSlots.forEach((slot, idx) => {
      // Buscar si hay una clase que coincida con este bloque
      const blockDate = new Date(date);
      const [hour, minute] = slot.split(':').map(Number);
      blockDate.setHours(hour, minute, 0, 0);
      const classBlock = classes.find((c) => {
        const cDate = new Date(c.date);
        return (
          cDate.getFullYear() === blockDate.getFullYear() &&
          cDate.getMonth() === blockDate.getMonth() &&
          cDate.getDate() === blockDate.getDate() &&
          ((c.start && c.start === slot) || (c.hour === hour && (!c.start || c.start.endsWith(':00') && minute === 0)))
        );
      });
      blocks.push({
        id: `${date.toISOString()}_${slot}`,
        time: slot,
        status: classBlock
          ? classBlock.status === 'scheduled'
            ? 'booked'
            : classBlock.status === 'free'
            ? 'available'
            : classBlock.status === 'cancelled'
            ? 'cancelled'
            : 'unavailable'
          : 'unavailable',
        date: new Date(date),
        hour,
        minute,
      });
    });
  });

  // Map block id to Class for click handler
  const classById = Object.fromEntries(classes.map(c => [c.id, c]));

  const handleBlockClick = (block: { id: string }) => {
    const classObj = classById[block.id];
    if (classObj) handleTimeBlockClick(classObj);
  };

  // --- Vista mensual moderna ---
  function renderMonthView() {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const weeks: number[][] = [];
    let week: number[] = [];
    // Rellenar días vacíos al inicio
    for (let i = 0; i < startDayOfWeek; i++) week.push(0);
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(0);
      weeks.push(week);
    }
    // Agrupar clases por día
    const classesByDay: Record<number, Class[]> = {};
    classes.forEach(c => {
      const date = new Date(c.date);
      if (date.getMonth() === month && date.getFullYear() === year) {
        const day = date.getDate();
        if (!classesByDay[day]) classesByDay[day] = [];
        classesByDay[day].push(c);
      }
    });
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse shadow-xl rounded-2xl bg-white">
          <thead>
            <tr>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
                <th key={i} className="p-2 border-b bg-gradient-to-br from-[#e8f6ef] to-[#f0f6ff] text-[#0056b3] text-lg font-bold text-center">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((day, di) => (
                  <td key={di} className={`align-top min-h-[90px] h-[90px] w-[120px] border p-1 ${day === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    {day !== 0 && (
                      <div className="flex flex-col h-full">
                        <div className="text-[#0056b3] font-bold text-lg mb-1">{day}</div>
                        <div className="flex flex-col gap-1 flex-1">
                          {(classesByDay[day] || []).map((c, idx) => (
                            <div
                              key={c.id + idx}
                              className={`rounded-lg px-2 py-1 text-xs font-semibold shadow transition-all cursor-pointer
                                ${c.status === 'scheduled' ? 'bg-[#0056b3] text-white hover:bg-[#27ae60]' : ''}
                                ${c.status === 'cancelled' ? 'bg-[#f44336] text-white hover:bg-[#b71c1c]' : ''}
                                ${c.status === 'free' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : ''}
                              `}
                              title={`Clase de ${c.start || c.hour + ':00'} a ${c.end || (c.hour + 1) + ':00'}`}
                            >
                              {c.status === 'scheduled' && 'Scheduled'}
                              {c.status === 'cancelled' && 'Cancelled'}
                              {c.status === 'free' && 'Free'}
                              <span className="ml-1 font-normal">{c.start || (c.hour + ':00')} - {c.end || ((c.hour + 1) + ':00')}</span>
                            </div>
                          ))}
                        </div>
                        {/* Badge de cantidad si hay muchas clases */}
                        {classesByDay[day] && classesByDay[day].length > 2 && (
                          <div className="mt-1 text-xs text-gray-400">+{classesByDay[day].length - 2} más</div>
                        )}
                      </div>
                    )}
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
    <div className="flex gap-8 w-full">
      {/* Sidebar izquierda */}
      {!hideSidebars && (
        <aside className="hidden md:flex flex-col w-72 bg-gradient-to-br from-[#e3f6fc] via-[#eafaf1] to-[#d4f1f4] border-l-4 border-[#27ae60] rounded-2xl shadow-2xl p-6 h-fit min-h-[600px] relative overflow-hidden">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0056b3] mb-2">Calendars</h2>
            <ul className="space-y-2 text-black">
              <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#0056b3]"></span> Scheduled</li>
              <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#f44336]"></span> Cancelled</li>
              <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-400"></span> Free</li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0056b3] mb-2">Month</h2>
            <div className="bg-white/70 rounded-lg p-2 text-center text-gray-500 border border-[#27ae60]">
              <MiniCalendar value={selectedDate} onChange={handleMiniCalendarChange} />
            </div>
          </div>
        </aside>
      )}
      {/* Calendario central */}
      <main className="flex-1">
        <div className="flex items-center gap-2 mb-4 bg-white/70 rounded-xl shadow p-2 w-fit mx-auto">
          <button onClick={handlePrev} className="p-2 rounded-full bg-[#e3f6fc] hover:bg-[#27ae60] text-[#0056b3] hover:text-white shadow transition-all"><HiChevronLeft size={22} /></button>
          <CalendarToolbar view={view} setView={setView} />
          <button onClick={handleNext} className="p-2 rounded-full bg-[#e3f6fc] hover:bg-[#27ae60] text-[#0056b3] hover:text-white shadow transition-all"><HiChevronRight size={22} /></button>
        </div>
        {/* Mensaje para el estudiante solo si hideSidebars está activo */}
        {hideSidebars && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-[#0056b3] text-center text-lg font-semibold">
            View available slots and book your class in one of them.<br />You cannot edit or cancel reservations.
          </div>
        )}
        {view === 'month' ? renderMonthView() : (
          <div className="rounded-3xl border-2 border-[#27ae60] shadow-2xl p-0 bg-transparent">
            <CalendarGrid
              blocks={blocks}
              onBlockClick={handleBlockClick}
            />
          </div>
        )}
      </main>
      {/* Sidebar derecha */}
      {!hideSidebars && (
        <aside className="hidden lg:flex flex-col w-80 bg-gradient-to-br from-[#e3f6fc] via-[#eafaf1] to-[#d4f1f4] border-r-4 border-[#0056b3] rounded-2xl shadow-2xl p-6 h-fit min-h-[600px] relative overflow-hidden">
          <h2 className="text-lg font-bold text-[#0056b3] mb-4">Class Summary</h2>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setClassFilter('scheduled')} className={`px-3 py-1 rounded font-semibold border ${classFilter==='scheduled' ? 'bg-[#0056b3] text-white' : 'bg-white text-[#0056b3] border-[#0056b3]'}`}>Scheduled</button>
            <button onClick={() => setClassFilter('cancelled')} className={`px-3 py-1 rounded font-semibold border ${classFilter==='cancelled' ? 'bg-[#f44336] text-white' : 'bg-white text-[#f44336] border-[#f44336]'}`}>Cancelled</button>
            <button onClick={() => setClassFilter('free')} className={`px-3 py-1 rounded font-semibold border ${classFilter==='free' ? 'bg-gray-400 text-white' : 'bg-white text-gray-400 border-gray-400'}`}>Free</button>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            {renderClassList()}
          </ul>
        </aside>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-4 sm:p-8 w-full max-w-xs sm:max-w-md bg-white rounded-2xl shadow-2xl border border-[#e0e0e0]">
          <h2 className="text-2xl font-extrabold mb-6 text-[#0056b3] text-center tracking-wide">Class Details</h2>
          {selectedBlock && (
            <div className="space-y-3">
              <div><span className="font-semibold text-[#27ae60]">Date:</span> <span className="text-gray-800">{selectedBlock.date ? (selectedBlock.date instanceof Date ? selectedBlock.date.toLocaleDateString() : new Date(selectedBlock.date).toLocaleDateString()) : ''}</span></div>
              <div><span className="font-semibold text-[#27ae60]">Start Hour:</span> <span className="text-gray-800">{selectedBlock.start ? selectedBlock.start : (selectedBlock.hour !== undefined ? `${selectedBlock.hour.toString().padStart(2, '0')}:00` : '')}</span></div>
              <div><span className="font-semibold text-[#27ae60]">End Hour:</span> <span className="text-gray-800">{selectedBlock.end ? selectedBlock.end : (selectedBlock.hour !== undefined ? `${(selectedBlock.hour + 1).toString().padStart(2, '0')}:00` : '')}</span></div>
              <div><span className="font-semibold text-[#0056b3]">Status:</span> <span className="capitalize text-gray-800">{selectedBlock.status}</span></div>
              {selectedBlock.studentId ? (
                <div className="pt-2 border-t border-gray-200">
                  <span className="font-semibold text-[#0056b3]">Student:</span>
                  {studentInfo ? (
                    <span className="ml-2 text-gray-900 font-bold">{studentInfo.name}</span>
                  ) : (
                    <span className="ml-2 text-gray-500">Loading...</span>
                  )}
                  {studentInfo && (
                    <div className="flex items-center gap-2 mt-1 ml-2 text-gray-600 text-sm">
                      <svg className="w-4 h-4 text-[#27ae60]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v1a4 4 0 01-8 0v-1" /></svg>
                      <span>{studentInfo.email}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-200 text-gray-400"><span className="font-semibold">Student:</span> Not assigned</div>
              )}
            </div>
          )}
          <button
            className="bg-[#0056b3] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#27ae60] transition-all mt-8 w-full shadow text-base sm:text-lg"
            onClick={() => setModalOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="p-6 text-black">
          <h2 className="text-xl font-bold mb-4">Schedule Class</h2>
          <div className="mb-2">Date: {addDate?.toLocaleDateString()}</div>
          <div className="mb-2">
            <label className="mr-2">Start hour:</label>
            <input type="number" min={6} max={17} value={addHour ?? ''} onChange={e => setAddHour(Number(e.target.value))} className="border rounded p-1 w-16 text-black" />
          </div>
          <div className="mb-4">
            <label className="mr-2">End hour:</label>
            <input type="number" min={6} max={18} value={(addHour ?? 6) + 1} onChange={e => setAddHour(Number(e.target.value))} className="border rounded p-1 w-16 text-black" />
          </div>
          <button className="bg-[#27ae60] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0056b3]" onClick={handleAddClass}>Confirm</button>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarView; 