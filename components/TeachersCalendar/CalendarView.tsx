/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import React, { useState, useEffect } from 'react';
import CalendarGrid from './CalendarGrid';
import CalendarToolbar from './CalendarToolbar';
import Modal from '../Modal';
import dynamic from 'next/dynamic';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import type { Class as CalendarClass, TimeSlot, MongoDBObjectId } from './types';
import LoadingSpinner from '../common/LoadingSpinner';
import useIsMobile from '../hooks/useIsMobile';

const MiniCalendar = dynamic(() => import('./MiniCalendar'), { ssr: false });

interface Class {
  id: string;
  date: Date;
  hour: number;
  status: 'scheduled' | 'cancelled' | 'available';
  studentId?: string | MongoDBObjectId;
  instructorId?: string | MongoDBObjectId;
  slots?: TimeSlot[];
  start?: string;
  end?: string;
  day?: number;
  classType?: string;
}

interface CalendarViewProps {
  classes: CalendarClass[];
  onClassClick: (classData: CalendarClass) => void;
  onScheduleUpdate?: () => void;
  hideSidebars?: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({ classes: initialClasses, onClassClick, onScheduleUpdate, hideSidebars }) => {
  // All hooks must be at the top level
  const [view, setView] = useState<'week' | 'month' | 'day'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<CalendarClass | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [classFilter, setClassFilter] = useState<'scheduled' | 'cancelled' | 'available'>('scheduled');
  const [studentInfo, setStudentInfo] = useState<{ firstName?: string; lastName?: string; email?: string } | null>(null);
  const [ticketClassInfo, setTicketClassInfo] = useState<any>(null);
  const [drivingClassInfo, setDrivingClassInfo] = useState<any>(null);
  const [locationInfo, setLocationInfo] = useState<any>(null);
  const [studentsInfo, setStudentsInfo] = useState<any[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  // Derived state
  const classes = initialClasses;

  // Paleta de colores para tipos de clase
  const classTypeColors: Record<string, string> = {
    'D.A.T.E.': 'bg-[#eafaf1] text-[#27ae60] border-[#27ae60]',
    'A.D.I.': 'bg-[#e3f6fc] text-[#0056b3] border-[#0056b3]',
    'B.D.I.': 'bg-[#ede7f6] text-[#7c3aed] border-[#7c3aed]',
  };

  // Añadir color para Driving Test
  classTypeColors['driving test'] = 'text-[#f39c12] border-[#f39c12]';

  // Badge de color para cada tipo de clase
  const classTypeBadgeColors: Record<string, string> = {
    'D.A.T.E.': 'bg-[#27ae60]',
    'A.D.I.': 'bg-[#0056b3]',
    'B.D.I.': 'bg-[#7c3aed]',
    'driving test': 'bg-[#f39c12]',
  };

  // Colores de status para el punto
  const statusDotColors: Record<string, string> = {
    'scheduled': 'bg-[#0056b3]',
    'available': 'bg-gray-400',
    'cancelled': 'bg-[#f44336]',
  };

  // Colores de fondo y borde para el bloque según classType
  const classTypeBlockColors: Record<string, string> = {
    'D.A.T.E.': 'bg-[#eafaf1] border-[#27ae60]',
    'A.D.I.': 'bg-[#e3f6fc] border-[#0056b3]',
    'B.D.I.': 'bg-[#ede7f6] border-[#7c3aed]',
    'driving test': 'bg-[#fff7e6] border-[#f39c12]',
  };

  // Colores hex para fondo y borde por classType
  const blockBgColors: Record<string, string> = {
    'D.A.T.E.': '#eafaf1',
    'A.D.I.': '#e3f6fc',
    'B.D.I.': '#ede7f6',
    'driving test': '#fff7e6',
  };

  const blockBorderColors: Record<string, string> = {
    'D.A.T.E.': '#27ae60',
    'A.D.I.': '#0056b3',
    'B.D.I.': '#7c3aed',
    'driving test': '#f39c12',
  };

  // Leyenda de colores para tipos de clase
  function renderClassTypeLegend() {
    return (
      <div className="w-full flex flex-col items-start justify-center gap-y-2 mt-2 mb-0 text-base font-bold tracking-wide">
        <span className="flex flex-row items-center gap-x-2">
          <span className="w-3 h-3 rounded-full bg-[#27ae60]"></span>
          <span className="text-[#27ae60]">D.A.T.E.</span>
        </span>
        <span className="flex flex-row items-center gap-x-2">
          <span className="w-3 h-3 rounded-full bg-[#0056b3]"></span>
          <span className="text-[#0056b3]">A.D.I.</span>
        </span>
        <span className="flex flex-row items-center gap-x-2">
          <span className="w-3 h-3 rounded-full bg-[#7c3aed]"></span>
          <span className="text-[#7c3aed]">B.D.I.</span>
        </span>
        <span className="flex flex-row items-center gap-x-2">
          <span className="w-3 h-3 rounded-full bg-[#f39c12]"></span>
          <span className="text-[#f39c12]">Driving Test</span>
        </span>
      </div>
    );
  }

  // Navegación entre semanas/meses
  const handlePrev = () => {
    if (view === 'week') {
      const prev = new Date(selectedDate);
      prev.setDate(selectedDate.getDate() - 7);
      setSelectedDate(prev);
    } else {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    }
  };
  const handleNext = () => {
    if (view === 'week') {
      const next = new Date(selectedDate);
      next.setDate(selectedDate.getDate() + 7);
      setSelectedDate(next);
    } else {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    }
  };

  // Permitir click para mostrar info en cualquier status para D.A.T.E., A.D.I., B.D.I.
  const handleTimeBlockClick = async (block: CalendarClass) => {
    // Solo Driving Test: solo scheduled
    if (block.classType === 'driving test') {
      if (block.status === 'scheduled') {
        setSelectedBlock(block);
        setModalOpen(true);
        if (block.studentId) {
          setStudentInfo(null); // Muestra "Loading..." mientras busca
          try {
            const res = await fetch(`/api/users?id=${block.studentId}`);
            const data = await res.json();
            setStudentInfo(data); // La API devuelve el usuario directamente
          } catch {
            setStudentInfo({ firstName: 'Not found', lastName: '' });
          }
        } else {
          setStudentInfo(null);
        }
      }
      onClassClick(block);
      return;
    }
    // Para D.A.T.E., A.D.I., B.D.I. permite abrir el modal en cualquier status
    const normalizedType = normalizeType(block.classType ?? '');
    if (['D.A.T.E.', 'A.D.I.', 'B.D.I.'].includes(normalizedType)) {
      setSelectedBlock(block);
      setModalOpen(true);
      setStudentInfo(null); // No mostrar info de un solo estudiante
      onClassClick(block);
      return;
    }
    // Por defecto, solo scheduled
    if (block.status === 'scheduled') {
      setSelectedBlock(block);
      setModalOpen(true);
      if (block.studentId) {
        setStudentInfo(null);
        try {
          const res = await fetch(`/api/users?id=${block.studentId}`);
          const data = await res.json();
          setStudentInfo(data);
        } catch {
          setStudentInfo({ firstName: 'Not found', lastName: '' });
        }
      } else {
        setStudentInfo(null);
      }
    }
    onClassClick(block);
  };

  const handleAddClass = async (date: Date, hour: number) => {
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: '67dda5c8448d12032b5d7a76',
          instructorId: selectedBlock?.instructorId || '681c2566f4e0eb5564f85205',
          date: date.toISOString().split('T')[0],
          start: `${hour.toString().padStart(2, '0')}:00`,
          end: `${(hour + 1).toString().padStart(2, '0')}:00`,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        if (onScheduleUpdate) await onScheduleUpdate();
      } else {
        alert('This slot is no longer available.');
      }
    } catch {
      alert('Error booking the class');
    }
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
    timeSlots.forEach((slot) => {
      // Calcular el intervalo de este bloque
      const [startHour, startMin] = slot.split(':').map(Number);
      let endHour = startHour;
      let endMin = startMin + 30;
      if (endMin >= 60) {
        endHour += 1;
        endMin -= 60;
      }
      const slotStart = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
      const slotEnd = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      // Comparar solo la fecha YYYY-MM-DD
      const blockDayStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const blockDate = new Date(date);
      blockDate.setHours(startHour, startMin, 0, 0);
      const classBlock = classes.find((c) => {
        const cDayStr = (typeof c.date === 'string'
          ? c.date
          : c.date instanceof Date
            ? `${c.date.getFullYear()}-${(c.date.getMonth()+1).toString().padStart(2, '0')}-${c.date.getDate().toString().padStart(2, '0')}`
            : ''
        ).slice(0, 10);
        const match =
          cDayStr === blockDayStr &&
          c.start === slotStart && c.end === slotEnd;
        return match;
      });
      blocks.push({
        id: `${date.toISOString()}_${slotStart}_${slotEnd}`,
        time: `${slotStart}-${slotEnd}`,
        status: classBlock
          ? classBlock.status === 'scheduled'
            ? 'booked'
            : classBlock.status === 'available'
            ? 'available'
            : classBlock.status === 'cancelled'
            ? 'cancelled'
            : 'unavailable'
          : 'unavailable',
        date: new Date(date),
        hour: startHour,
        minute: startMin,
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
    const classesByDay: Record<number, CalendarClass[]> = {};
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
        <table className="min-w-full border-collapse shadow-2xl rounded-2xl bg-gradient-to-br from-[#e3f6fc] via-[#eafaf1] to-[#d4f1f4]">
          <thead>
            <tr>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
                <th key={i} className="p-2 border-b bg-gradient-to-br from-[#e8f6ef] to-[#f0f6ff] text-[#0056b3] text-lg font-bold text-center tracking-wide uppercase shadow-inner">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week: number[], weekIndex: number) => (
              <tr key={weekIndex}>
                {week.map((day: number, dayIndex: number) => {
                  const isToday = day !== 0 && new Date(year, month, day).toDateString() === new Date().toDateString();
                  return (
                    <td
                      key={dayIndex}
                      className={`align-top min-h-[100px] h-[100px] w-[120px] border p-2 rounded-2xl transition-all duration-200 ${day === 0 ? 'bg-gray-50' : isToday ? 'bg-[#b2f2d7] border-2 border-[#27ae60] shadow-lg scale-105' : 'bg-white hover:bg-[#e3f6fc]'} group`}
                    >
                      {day !== 0 && (
                        <div className="flex flex-col h-full">
                          <div className={`text-center font-extrabold text-lg mb-1 ${isToday ? 'text-[#27ae60]' : 'text-[#0056b3]'}`}>{day}</div>
                          <div className="flex flex-col gap-1 flex-1">
                            {/* Agrupar bloques contiguos por status y mostrar rangos */}
                            {(() => {
                              const dayClasses = (classesByDay[day] || []).slice().filter(c => c.start && c.end).sort((a, b) => {
                                const [ah, am] = (a.start || '').split(':').map(Number);
                                const [bh, bm] = (b.start || '').split(':').map(Number);
                                return ah !== bh ? ah - bh : am - bm;
                              });
                              if (dayClasses.length === 0) return null;
                              // Agrupar por status y contiguos
                              const grouped: { status: string, start: string, end: string }[] = [];
                              let curr = { status: dayClasses[0].status, start: dayClasses[0].start!, end: dayClasses[0].end! };
                              for (let i = 1; i < dayClasses.length; i++) {
                                const currSlot = dayClasses[i];
                                if (curr.status === currSlot.status && currSlot.start === curr.end) {
                                  curr.end = currSlot.end!;
                                } else {
                                  grouped.push({ ...curr });
                                  curr = { status: currSlot.status, start: currSlot.start!, end: currSlot.end! };
                                }
                              }
                              grouped.push({ ...curr });
                              return grouped.map((g, idx) => {
                                const block = dayClasses.find(c => c.status === g.status && c.start === g.start && c.end === g.end);
                                const type = block?.classType;
                                const normalizedType = normalizeType(type ?? '');
                                const blockBg = blockBgColors[normalizedType] || '#fff';
                                const blockBorder = blockBorderColors[normalizedType] || '#e0e0e0';
                                const badgeColor = statusDotColors[(block?.status ?? '') as string] || 'bg-gray-400';
                                return (
                                  <div
                                    key={idx}
                                    className="rounded-xl px-2 py-1 text-xs font-bold shadow transition-all mb-1 flex items-center gap-1"
                                    style={{ background: blockBg, border: `2px solid ${blockBorder}` }}
                                    title={`${block?.status ? block.status.charAt(0).toUpperCase() + block.status.slice(1) : ''} ${g.start} - ${g.end}`}
                                    onClick={block && block.status === 'scheduled' ? () => handleTimeBlockClick(block) : undefined}
                                  >
                                    <span className={`inline-block w-3 h-3 rounded-full ${badgeColor}`}></span>
                                    <span className="capitalize">{block?.classType ?? ''} - {block?.status ?? ''}</span>
                                    <span className="ml-1 font-normal">{g.start} - {g.end}</span>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // --- NUEVO: Agrupar bloques visibles por status para el panel derecho ---
  // Filtrar solo las clases del mes o semana visible
  let summaryClasses = classes;
  if (view === 'month') {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    summaryClasses = classes.filter(c => {
      const d = c.date instanceof Date ? c.date : new Date(c.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  } else if (view === 'week') {
    const weekDates = getVisibleDates().map(d => d.setHours(0,0,0,0));
    summaryClasses = classes.filter(c => {
      const d = c.date instanceof Date ? c.date : new Date(c.date);
      return weekDates.includes(new Date(d).setHours(0,0,0,0));
    });
  }
  const summaryByStatus = { scheduled: [], cancelled: [], available: [] } as Record<'scheduled'|'cancelled'|'available', { day: string, time: string }[]>;
  summaryClasses.forEach(c => {
    const dateObj = new Date(c.date);
    const dayStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
    const timeStr = `${c.start || (c.hour?.toString().padStart(2, '0') + ':00')} - ${c.end || ((c.hour + 1)?.toString().padStart(2, '0') + ':00')}`;
    if (c.status === 'scheduled') summaryByStatus.scheduled.push({ day: dayStr, time: timeStr });
    if (c.status === 'cancelled') summaryByStatus.cancelled.push({ day: dayStr, time: timeStr });
    if (c.status === 'available') summaryByStatus.available.push({ day: dayStr, time: timeStr });
  });

  const isMobile = useIsMobile();

  // Vista móvil tipo agenda
  function renderMobileAgenda() {
    // Agrupa bloques por día
    const grouped = classes.reduce((acc, b) => {
      const key = b.date instanceof Date ? b.date.toLocaleDateString() : new Date(b.date).toLocaleDateString();
      acc[key] = acc[key] || [];
      acc[key].push(b);
      return acc;
    }, {} as Record<string, CalendarClass[]>);
    return (
      <div className="space-y-4">
        {Object.entries(grouped).map(([date, dayBlocks]) => (
          <div key={date} className="bg-white rounded-xl shadow p-3">
            <div className="font-bold text-[#0056b3] text-lg mb-2">{date}</div>
            {dayBlocks.sort((a, b) => (a.start || '').localeCompare(b.start || '')).map((b) => {
              const normalizedType = normalizeType(b.classType ?? '');
              const blockBg = blockBgColors[normalizedType] || '#fff';
              const blockBorder = blockBorderColors[normalizedType] || '#e0e0e0';
              const badgeColor = statusDotColors[(b.status ?? '') as string] || 'bg-gray-400';
              return (
                <div
                  key={b.id}
                  className="p-2 mb-1 rounded flex items-center gap-2 text-sm font-semibold cursor-pointer transition-all"
                  style={{ background: blockBg, border: `2px solid ${blockBorder}` }}
                  onClick={() => handleTimeBlockClick(b)}
                >
                  <span className={`inline-block w-3 h-3 rounded-full ${badgeColor}`}></span>
                  <span className="font-mono">{b.start}-{b.end}</span>
                  <span className="ml-2 capitalize">{b.classType ? `${b.classType} - ` : ''}{b.status}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Vista móvil: selector de vista
  function renderMobileViewSelector() {
    return (
      <div className="flex justify-center gap-2 mb-4">
        <button onClick={() => { setView('day'); setSelectedDate(new Date()); }} className={`px-3 py-1 rounded font-semibold border ${view==='day' ? 'bg-[#27ae60] text-white' : 'bg-white text-[#27ae60] border-[#27ae60]'}`}>Day</button>
        <button onClick={() => { setView('week'); setSelectedDate(new Date()); }} className={`px-3 py-1 rounded font-semibold border ${view==='week' ? 'bg-[#0056b3] text-white' : 'bg-white text-[#0056b3] border-[#0056b3]'}`}>Week</button>
      </div>
    );
  }

  // Flechas para avanzar día o semana en móvil
  function renderMobileNavArrows() {
    return (
      <div className="flex justify-center items-center gap-4 mb-2">
        <button onClick={() => {
          if (view === 'day') {
            const prev = new Date(selectedDate);
            prev.setDate(selectedDate.getDate() - 1);
            setSelectedDate(prev);
          } else if (view === 'week') {
            const prev = new Date(selectedDate);
            prev.setDate(selectedDate.getDate() - 7);
            setSelectedDate(prev);
          }
        }} className="p-2 rounded-full bg-[#e3f6fc] hover:bg-[#27ae60] text-[#0056b3] hover:text-white shadow transition-all">
          <HiChevronLeft size={22} />
        </button>
        <span className="font-bold text-[#27ae60] text-lg">
          {view === 'day' ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : weekRangeLabel(selectedDate)}
        </span>
        <button onClick={() => {
          if (view === 'day') {
            const next = new Date(selectedDate);
            next.setDate(selectedDate.getDate() + 1);
            setSelectedDate(next);
          } else if (view === 'week') {
            const next = new Date(selectedDate);
            next.setDate(selectedDate.getDate() + 7);
            setSelectedDate(next);
          }
        }} className="p-2 rounded-full bg-[#e3f6fc] hover:bg-[#27ae60] text-[#0056b3] hover:text-white shadow transition-all">
          <HiChevronRight size={22} />
        </button>
      </div>
    );
  }

  // Label de rango de semana
  function weekRangeLabel(date: Date) {
    const start = new Date(date);
    start.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  // Vista móvil: semana actual
  function renderMobileWeekView() {
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - ((selectedDate.getDay() + 6) % 7));
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
    return (
      <div className="flex flex-col gap-2">
        {days.map((day) => {
          const dayClasses = classes.filter(c => {
            const d = c.date instanceof Date ? c.date : new Date(c.date);
            return d.toDateString() === day.toDateString();
          }).sort((a, b) => (a.start || '').localeCompare(b.start || ''));
          return (
            <div key={day.toISOString()} className={`bg-white rounded-xl shadow p-3 ${day.toDateString() === new Date().toDateString() ? 'border-2 border-[#27ae60]' : ''}`}>
              <div className={`font-bold text-[#0056b3] text-md mb-2 text-center ${day.toDateString() === new Date().toDateString() ? 'text-[#27ae60]' : ''}`}>{day.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              {dayClasses.length === 0 && <div className="text-gray-400 text-center">No classes</div>}
              {dayClasses.map((b) => {
                const normalizedType = normalizeType(b.classType ?? '');
                const blockBg = blockBgColors[normalizedType] || '#fff';
                const blockBorder = blockBorderColors[normalizedType] || '#e0e0e0';
                const badgeColor = statusDotColors[(b.status ?? '') as string] || 'bg-gray-400';
                return (
                  <div
                    key={b.id}
                    className="p-2 mb-1 rounded flex items-center gap-2 text-sm font-semibold cursor-pointer transition-all"
                    style={{ background: blockBg, border: `2px solid ${blockBorder}` }}
                    onClick={() => handleTimeBlockClick(b)}
                  >
                    <span className={`inline-block w-3 h-3 rounded-full ${badgeColor}`}></span>
                    <span className="font-mono">{b.start}-{b.end}</span>
                    <span className="ml-2 capitalize">{b.classType ? `${b.classType} - ` : ''}{b.status}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // Vista móvil: día actual
  function renderMobileDayView() {
    const today = new Date(selectedDate);
    const dayClasses = classes.filter(c => {
      const d = c.date instanceof Date ? c.date : new Date(c.date);
      return d.toDateString() === today.toDateString();
    }).sort((a, b) => (a.start || '').localeCompare(b.start || ''));
    return (
      <div className="bg-white rounded-xl shadow p-3 mb-4">
        {dayClasses.length === 0 && <div className="text-gray-400 text-center">No classes</div>}
        {dayClasses.map((b) => {
          const normalizedType = normalizeType(b.classType ?? '');
          const blockBg = blockBgColors[normalizedType] || '#fff';
          const blockBorder = blockBorderColors[normalizedType] || '#e0e0e0';
          const badgeColor = statusDotColors[(b.status ?? '') as string] || 'bg-gray-400';
          return (
            <div
              key={b.id}
              className="p-2 mb-1 rounded flex items-center gap-2 text-sm font-semibold cursor-pointer transition-all"
              style={{ background: blockBg, border: `2px solid ${blockBorder}` }}
              onClick={() => handleTimeBlockClick(b)}
            >
              <span className={`inline-block w-3 h-3 rounded-full ${badgeColor}`}></span>
              <span className="font-mono">{b.start}-{b.end}</span>
              <span className="ml-2 capitalize">{b.classType ? `${b.classType} - ` : ''}{b.status}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Vista semanal con columna de horarios y bloques alineados
  function renderWeekViewWithTime() {
    const monthLabel = selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    const startHour = 6;
    const endHour = 20;
    const timeLabels: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      timeLabels.push(`${h.toString().padStart(2, '0')}:00`);
      timeLabels.push(`${h.toString().padStart(2, '0')}:30`);
    }
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - ((startOfWeek.getDay() + 6) % 7));
    const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });
    // Agrupar clases por día
    const classesByDay: Record<string, CalendarClass[]> = {};
    weekDays.forEach((d) => {
      const key = d.toISOString().slice(0, 10);
      classesByDay[key] = [];
    });
    classes.forEach(c => {
      const d = typeof c.date === 'string' ? c.date : c.date.toISOString().slice(0, 10);
      if (classesByDay[d]) classesByDay[d].push(c);
    });
    return (
      <>
        <div className="text-3xl font-extrabold text-center mb-4 text-[#27ae60] tracking-wide select-none">{monthLabel}</div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse shadow-2xl rounded-2xl bg-gradient-to-br from-[#e3f6fc] via-[#eafaf1] to-[#d4f1f4] instructor-calendar-table">
            <thead>
              <tr>
                <th className="p-2 bg-white text-center font-bold w-20 md:w-32 sticky left-0 z-10" style={{ color: '#27ae60', border: '1px solid #e0e0e0', fontSize: '1rem', background: '#f8fafd', minWidth: 60, maxWidth: 60 }}>Time</th>
                {weekDays.map((d, i) => (
                  <th key={i} className="p-2 text-center font-bold w-20 md:w-32" style={{ color: '#0056b3', border: '1px solid #e0e0e0', fontSize: '1rem', minWidth: 60, maxWidth: 60, background: '#f8fafd' }}>
                    <div className="flex flex-col items-center justify-center">
                      <span className="uppercase tracking-wide" style={{ fontSize: '0.95rem' }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="font-extrabold text-lg" style={{ letterSpacing: 1 }}>{d.getDate()}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeLabels.map((label, rowIdx) => (
                <tr key={label}>
                  <td className="p-2 border text-center font-bold w-20 md:w-32 sticky left-0 z-10" style={{ color: '#27ae60', border: '1px solid #e0e0e0', background: '#fff', minWidth: 60, maxWidth: 60 }}>{label}</td>
                  {weekDays.map((d, colIdx) => {
                    const key = d.toISOString().slice(0, 10);
                    const dayClasses = (classesByDay[key] || []).slice().filter(c => c.start && c.end);
                    // Buscar si hay una clase que inicia en este slot
                    const classBlock = dayClasses.find(c => c.start === label);
                    if (classBlock) {
                      // Calcular cuántos slots abarca la clase
                      const [startHour, startMin] = classBlock.start!.split(':').map(Number);
                      const [endHour, endMin] = classBlock.end!.split(':').map(Number);
                      let slots = (endHour - startHour) * 2 + (endMin - startMin) / 30;
                      if (slots < 1) slots = 1;
                      // Normalizar el tipo de clase para buscar el color
                      const normalizedType = normalizeType(classBlock.classType ?? '');
                      const blockBg = blockBgColors[normalizedType] || '#fff';
                      const blockBorder = blockBorderColors[normalizedType] || '#e0e0e0';
                      const typeText = classTypeColors[normalizedType] || '';
                      const badgeColor = statusDotColors[(classBlock.status ?? '') as string] || 'bg-gray-400';
                      return (
                        <td
                          key={colIdx}
                          rowSpan={slots}
                          className={`align-middle w-20 md:w-32`}
                          style={{
                            position: 'relative',
                            padding: 0,
                            cursor: (['D.A.T.E.', 'A.D.I.', 'B.D.I.'].includes(normalizedType) || classBlock.status === 'scheduled') ? 'pointer' : 'default',
                            height: `${22 * slots}px`,
                            minHeight: `${22 * slots}px`,
                            minWidth: 60,
                            maxWidth: 60,
                            background: blockBg,
                            border: `2px solid ${blockBorder}`
                          }}
                          onClick={() => (['D.A.T.E.', 'A.D.I.', 'B.D.I.'].includes(normalizedType) || classBlock.status === 'scheduled') ? handleTimeBlockClick(classBlock) : undefined}
                        >
                          <div className={`flex flex-col items-center justify-center w-full font-bold gap-1`} 
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, fontSize: '0.95rem', borderRadius: 12, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}>
                            <div className="flex items-center gap-2">
                              <span className={`inline-block w-3 h-3 rounded-full ${badgeColor}`}></span>
                              <span className={`capitalize font-bold ${typeText}`}>{classBlock.classType}</span>
                            </div>
                            <span className="font-semibold text-gray-700">{classBlock.status.charAt(0).toUpperCase() + classBlock.status.slice(1)}</span>
                            <span className="font-normal text-gray-700">{classBlock.start} - {classBlock.end}</span>
                          </div>
                        </td>
                      );
                    }
                    // Si ya hay una clase que abarca este slot, dejar la celda vacía
                    const isCovered = dayClasses.some(c => {
                      const [startHour, startMin] = c.start!.split(':').map(Number);
                      const [endHour, endMin] = c.end!.split(':').map(Number);
                      const [labelHour, labelMin] = label.split(':').map(Number);
                      const labelMinutes = labelHour * 60 + (labelMin || 0);
                      const startMinutes = startHour * 60 + startMin;
                      const endMinutes = endHour * 60 + endMin;
                      return labelMinutes > startMinutes && labelMinutes < endMinutes;
                    });
                    if (isCovered) {
                      return null;
                    }
                    // Celda vacía
                    return (
                      <td key={colIdx} className="p-0 border text-center align-middle bg-white w-20 md:w-32" style={{ border: '1px solid #e0e0e0', height: '22px', minHeight: '22px', minWidth: 60, maxWidth: 60 }}>
                        <div className="flex items-center justify-center w-full" style={{ height: '22px' }}></div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // Fetch extra info SOLO para D.A.T.E., A.D.I., B.D.I.
  useEffect(() => {
    if (!selectedBlock || !selectedBlock.classType || selectedBlock.classType === 'driving test' || !selectedBlock.ticketClassId) {
      setTicketClassInfo(null);
      setDrivingClassInfo(null);
      setLocationInfo(null);
      setStudentsInfo([]);
      setLoadingExtra(false);
      return;
    }
    setLoadingExtra(true);
    setTicketClassInfo(null);
    setDrivingClassInfo(null);
    setLocationInfo(null);
    setStudentsInfo([]);
    // 1. TicketClass
    fetch(`/api/ticketclasses/${selectedBlock.ticketClassId}`)
      .then(res => res.json())
      .then(async (ticketClass) => {
        setTicketClassInfo(ticketClass);
        // 2. DrivingClass
        if(ticketClass.classId) {
          fetch(`/api/drivingclasses/${ticketClass.classId}`)
            .then(res => res.json())
            .then(setDrivingClassInfo);
        }
        // 3. Location
        if(ticketClass.locationId) {
          fetch(`/api/locations/${ticketClass.locationId}`)
            .then(res => res.json())
            .then(setLocationInfo);
        }
        // 4. Students
        if(ticketClass.students && Array.isArray(ticketClass.students)) {
          const students = await Promise.all(ticketClass.students.map(async (s: any) => {
            let id = '';
            if (typeof s === 'string') id = s;
            else if (typeof s === 'object' && s.studentId) id = s.studentId;
            else return null;
            const res = await fetch(`/api/users?id=${id}`);
            const user = await res.json();
            return user && !user.error ? user : null;
          }));
          setStudentsInfo(students.filter(Boolean));
        }
        setLoadingExtra(false);
      })
      .catch(() => setLoadingExtra(false));
  }, [selectedBlock]);

  // El return principal del componente debe estar fuera de cualquier función
  return (
    <div className="w-full">
      {/* Encabezado único y margen superior responsivo */}
      <div className={`flex flex-col items-center justify-center ${isMobile ? 'mt-4' : 'mt-32 md:mt-16'} pb-4 px-2 w-full`}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center tracking-wide mb-2 w-full whitespace-pre-line break-words" style={{ wordBreak: 'break-word', lineHeight: 1.1 }}>
          <span className="text-[#0056b3]">INSTRUCTOR</span> <span className="text-[#27ae60]">SCHEDULE</span>
        </h1>
        {!isMobile && (
          <div className="flex items-center gap-2 mb-4 bg-white/70 rounded-xl shadow p-2 w-fit mx-auto">
            <button onClick={handlePrev} className="p-2 rounded-full bg-[#e3f6fc] hover:bg-[#27ae60] text-[#0056b3] hover:text-white shadow transition-all"><HiChevronLeft size={22} /></button>
            <CalendarToolbar view={view} setView={setView} />
            <button onClick={handleNext} className="p-2 rounded-full bg-[#e3f6fc] hover:bg-[#27ae60] text-[#0056b3] hover:text-white shadow transition-all"><HiChevronRight size={22} /></button>
          </div>
        )}
      </div>
      <div className="flex gap-8 w-full flex-col lg:flex-row">
      {/* Sidebar izquierda */}
      {!hideSidebars && !isMobile && (
          <aside className="hidden md:flex flex-col w-full md:w-72 bg-gradient-to-br from-[#e3f6fc] via-[#eafaf1] to-[#d4f1f4] border-l-4 border-[#27ae60] rounded-2xl shadow-2xl p-6 h-[95%] min-h-[600px] relative overflow-hidden" style={{ height: '95vh' }}>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0056b3] mb-2">Calendars</h2>
            <ul className="space-y-2 text-black">
              <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#0056b3]"></span> Scheduled</li>
              <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#f44336]"></span> Cancelled</li>
              <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-400"></span> Available</li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0056b3] mb-2">Month</h2>
            <div className="bg-white/70 rounded-lg p-2 text-center text-gray-500 border border-[#27ae60]">
                <MiniCalendar value={selectedDate} onChange={(date) => {
                  setSelectedDate(date);
                  // Si la vista es mensual, asegúrate de que el mes cambie
                  if (view === 'month') {
                    setSelectedDate(new Date(date.getFullYear(), date.getMonth(), 1));
                  }
                }} />
            </div>
          </div>
          {renderClassTypeLegend()}
        </aside>
      )}
      {/* Calendario central */}
        <main className="flex-1 min-w-0">
          {isMobile ? (
            <div className="rounded-3xl border-2 border-[#27ae60] shadow-2xl p-2 bg-gradient-to-br from-[#e3f6fc] via-[#eafaf1] to-[#d4f1f4] max-w-full mx-auto transition-all duration-500 min-w-[320px]">
              {renderMobileViewSelector()}
              {renderMobileNavArrows()}
              {view === 'day' && renderMobileDayView()}
              {view === 'week' && renderMobileWeekView()}
            </div>
          ) : (
            view === 'month' ? (
              <>
                <div className="text-[#27ae60] font-extrabold text-2xl mb-2 text-center tracking-wide uppercase drop-shadow-sm select-none">
                  {selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                {renderMonthView()}
              </>
            ) : (
              <>
                {renderWeekViewWithTime()}
              </>
            )
          )}
      </main>
      {/* Sidebar derecha */}
      {!hideSidebars && !isMobile && (
          <aside className="hidden lg:flex flex-col w-full lg:w-80 bg-gradient-to-br from-[#e3f6fc] via-[#eafaf1] to-[#d4f1f4] border-r-4 border-[#0056b3] rounded-2xl shadow-2xl p-6 h-[95%] min-h-[600px] relative overflow-hidden" style={{ height: '95vh' }}>
          <h2 className="text-lg font-bold text-[#0056b3] mb-4">Class Summary</h2>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setClassFilter('scheduled')} className={`px-3 py-1 rounded font-semibold border text-sm ${classFilter==='scheduled' ? 'bg-[#0056b3] text-white' : 'bg-white text-[#0056b3] border-[#0056b3]'}`}>Scheduled</button>
            <button onClick={() => setClassFilter('cancelled')} className={`px-3 py-1 rounded font-semibold border text-sm ${classFilter==='cancelled' ? 'bg-[#f44336] text-white' : 'bg-white text-[#f44336] border-[#f44336]'}`}>Cancelled</button>
            <button onClick={() => setClassFilter('available')} className={`px-3 py-1 rounded font-semibold border text-sm ${classFilter==='available' ? 'bg-gray-400 text-white' : 'bg-white text-gray-400 border-gray-400'}`}>Available</button>
          </div>
          <div className="font-bold mb-1" style={{ color: classFilter === 'scheduled' ? '#0056b3' : classFilter === 'cancelled' ? '#f44336' : '#888' }}>
            {classFilter.charAt(0).toUpperCase() + classFilter.slice(1)}
          </div>
            {/* Panel derecho: lista agrupada de rangos por día */}
            <div className="overflow-y-auto max-h-[60vh] pr-1">
              <ul className="text-sm text-gray-700 space-y-1 transition-all duration-300">
                {(() => {
                  // Filtrar por status seleccionado SOLO sobre summaryClasses
                  const filtered = summaryClasses.filter((slot: CalendarClass) => {
                    let status = slot.status;
                    if (String(status) === 'canceled' || String(status) === 'cancelled') status = 'cancelled';
                    return status === classFilter;
                  });
                  if (filtered.length === 0) return null;
                  // Agrupar por fecha
                  const byDate: Record<string, Partial<CalendarClass>[]> = {};
                  filtered.forEach(slot => {
                    let dateStr = '';
                    if (typeof slot.date === 'string') {
                      dateStr = (slot.date as string).replace(/-/g, '/');
                    } else if (slot.date instanceof Date && !isNaN(slot.date.getTime())) {
                      dateStr = slot.date.toISOString().split('T')[0].replace(/-/g, '/');
                    } else {
                      dateStr = '';
                    }
                    if (!byDate[dateStr]) byDate[dateStr] = [];
                    byDate[dateStr].push(slot);
                  });
                  // Para cada fecha, agrupar slots contiguos
                  return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, slots]) => {
                    // Ordenar por hora de inicio
                    const sorted = slots.slice().sort((a, b) => {
                      const [ah, am] = (a.start ?? '').split(':').map(Number);
                      const [bh, bm] = (b.start ?? '').split(':').map(Number);
                      return ah !== bh ? ah - bh : am - bm;
                    });
                    // Agrupar contiguos
                    const ranges: { start: string; end: string }[] = [];
                    let rangeStart = sorted[0].start ?? '';
                    let rangeEnd = sorted[0].end ?? '';
                    for (let i = 1; i < sorted.length; i++) {
                      if ((sorted[i].start ?? '') === rangeEnd) {
                        rangeEnd = sorted[i].end ?? '';
                      } else {
                        ranges.push({ start: rangeStart, end: rangeEnd });
                        rangeStart = sorted[i].start ?? '';
                        rangeEnd = sorted[i].end ?? '';
                      }
                    }
                    ranges.push({ start: rangeStart, end: rangeEnd });
                    return (
                      <li key={date} className="mb-2 animate-fade-in">
                        <span className="font-bold text-[#27ae60] bg-[#eafaf1] px-2 py-1 rounded shadow-sm mr-2 block mb-1" style={{fontWeight: 700}}>{date}</span>
                        <div className="flex flex-col gap-1 ml-2">
                          {ranges.map((r, idx) => (
                            <span key={idx} className={`inline-block rounded px-3 py-1 mb-1 shadow font-semibold w-full transition-all duration-300
                              ${classFilter === 'available' ? 'bg-[#eafaf1] text-[#27ae60] border border-[#27ae60]' : ''}
                              ${classFilter === 'scheduled' ? 'bg-[#0056b3] text-white' : ''}
                              ${classFilter === 'cancelled' ? 'bg-[#f44336] text-white' : ''}
                            `} style={{marginBottom: 4}}>
                              {r.start}-{r.end}
                            </span>
                          ))}
                        </div>
                      </li>
                    );
                  });
                })()}
          </ul>
            </div>
        </aside>
      )}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="py-6 px-2 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#e0e0e0] mx-auto flex flex-col items-center justify-center" style={{ minWidth: '0', width: '100%' }}>
          <h2 className="text-2xl font-extrabold mb-6 text-[#0056b3] text-center tracking-wide">Class Details</h2>
          {selectedBlock && (
            <div className="space-y-3 w-full">
              <div><span className="font-semibold text-[#27ae60]">Date:</span> <span className="text-gray-800">{selectedBlock.date ? (selectedBlock.date instanceof Date ? selectedBlock.date.toLocaleDateString() : new Date(selectedBlock.date).toLocaleDateString()) : ''}</span></div>
              <div><span className="font-semibold text-[#27ae60]">Start Hour:</span> <span className="text-gray-800">{selectedBlock.start ? selectedBlock.start : (selectedBlock.hour !== undefined ? `${selectedBlock.hour.toString().padStart(2, '0')}:00` : '')}</span></div>
              <div><span className="font-semibold text-[#27ae60]">End Hour:</span> <span className="text-gray-800">{selectedBlock.end ? selectedBlock.end : (selectedBlock.hour !== undefined ? `${(selectedBlock.hour + 1).toString().padStart(2, '0')}:00` : '')}</span></div>
              <div><span className="font-semibold text-[#0056b3]">Status:</span> <span className="capitalize text-gray-800">{selectedBlock.status}</span></div>
              {selectedBlock.classType && (
                <div><span className="font-semibold text-[#0056b3]">Class Type:</span> <span className="capitalize text-gray-800">{selectedBlock.classType}</span></div>
              )}
              {/* DRIVING TEST: igual que antes */}
              {selectedBlock.classType === 'driving test' && (
                <div className="rounded-xl border border-[#f39c12] bg-[#fff7e6] p-3 mt-2 space-y-2">
                  <div className="font-bold text-[#f39c12] text-lg">Driving Test Details</div>
                  <div><span className="font-semibold text-[#0056b3]">Pickup Location:</span> <span className="text-gray-800">{selectedBlock.pickupLocation || <span className="italic text-gray-400">Not specified</span>}</span></div>
                  <div><span className="font-semibold text-[#0056b3]">Dropoff Location:</span> <span className="text-gray-800">{selectedBlock.dropoffLocation || <span className="italic text-gray-400">Not specified</span>}</span></div>
                  <div><span className="font-semibold text-[#0056b3]">Amount:</span> <span className="text-gray-800">{selectedBlock.amount !== undefined ? `$${selectedBlock.amount}` : <span className="italic text-gray-400">Not specified</span>}</span></div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#0056b3]">Paid:</span>
                    {selectedBlock.paid ? (
                      <span className="inline-flex items-center gap-1 text-green-600 font-bold"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Paid</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 font-bold"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Not Paid</span>
                    )}
                  </div>
                </div>
              )}
              {/* D.A.T.E., A.D.I., B.D.I. - Info avanzada */}
              {['D.A.T.E.', 'A.D.I.', 'B.D.I.'].includes(normalizeType(selectedBlock.classType ?? '')) && (
                <div className="rounded-xl border border-[#0056b3] bg-[#e3f6fc] p-3 mt-2 space-y-2 animate-fade-in">
                  {loadingExtra ? (
                    <div className="flex items-center gap-2 text-[#0056b3] font-bold"><LoadingSpinner /> Loading class details...</div>
                  ) : (
                    <>
                      <div className="font-bold text-[#0056b3] text-lg mb-2">Class Group Details</div>
                      <div><span className="font-semibold">Class Name:</span> <span className="text-gray-800">{drivingClassInfo?.title || <span className="italic text-gray-400">Not found</span>}</span></div>
                      <div><span className="font-semibold">Location:</span> <span className="text-gray-800">{locationInfo?.title || <span className="italic text-gray-400">Not found</span>}</span></div>
                      <div><span className="font-semibold">Total Spots:</span> <span className="text-gray-800">{ticketClassInfo?.cupos ?? <span className="italic text-gray-400">?</span>}</span></div>
                      <div><span className="font-semibold">Occupied:</span> <span className="text-gray-800">{studentsInfo.length}</span></div>
                      <div className="font-semibold mt-2 mb-1">Students:</div>
                      {studentsInfo.length === 0 ? (
                        <div className="italic text-gray-400">No students enrolled yet.</div>
                      ) : (
                        <ul className="divide-y divide-[#b2f2d7]">
                          {studentsInfo.map((s, idx) => (
                            <li key={s._id || idx} className="py-1 flex flex-col sm:flex-row sm:items-center gap-1">
                              <span className="font-bold text-[#0056b3]">{s.firstName} {s.lastName}</span>
                              <span className="text-gray-600 text-sm">{s.email}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              )}
              {!['D.A.T.E.', 'A.D.I.', 'B.D.I.'].includes(normalizeType(selectedBlock.classType ?? '')) && (
                selectedBlock.studentId ? (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="font-semibold text-[#0056b3]">Student:</span>
                    {studentInfo ? (
                      <span className="ml-2 text-gray-900 font-bold">{studentInfo.firstName} {studentInfo.lastName}</span>
                    ) : (
                      <LoadingSpinner />
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
                )
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
          <div className="mb-2">Date: {selectedDate?.toLocaleDateString()}</div>
          <div className="mb-2">
            <label className="mr-2">Start hour:</label>
            <input type="number" min={6} max={17} value={selectedDate?.getHours() ?? ''} onChange={e => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), Number(e.target.value)))} className="border rounded p-1 w-16 text-black" />
          </div>
          <div className="mb-4">
            <label className="mr-2">End hour:</label>
            <input type="number" min={6} max={18} value={(selectedDate?.getHours() ?? 6) + 1} onChange={e => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), Number(e.target.value)))} className="border rounded p-1 w-16 text-black" />
          </div>
          <button className="bg-[#27ae60] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0056b3]" onClick={() => handleAddClass(selectedDate, selectedDate.getHours())}>Confirm</button>
        </div>
      </Modal>
    </div>
  );
};

function normalizeType(type: string) {
  if (!type) return '';
  const t = type.toUpperCase().replace(/\s+/g, '').replace(/\./g, '');
  if (t.includes('DATE')) return 'D.A.T.E.';
  if (t.includes('ADI')) return 'A.D.I.';
  if (t.includes('BDI')) return 'B.D.I.';
  if (t.includes('DRIVINGTEST')) return 'driving test';
  return type;
}

export default CalendarView; 