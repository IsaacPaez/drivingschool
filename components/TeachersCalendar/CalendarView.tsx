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

// Clase: { date: Date, hour?: number, status: 'scheduled' | 'canceled' }

interface CalendarViewProps {
  schedule: any[];
  onScheduleUpdate?: () => void;
  hideSidebars?: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({ schedule, onScheduleUpdate, hideSidebars }) => {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [classes, setClasses] = useState<any[]>([]);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDate, setAddDate] = useState<Date | null>(null);
  const [addHour, setAddHour] = useState<number | null>(null);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const [classFilter, setClassFilter] = useState<'scheduled' | 'cancelled' | 'free'>('scheduled');

  useEffect(() => {
    console.log('Schedule recibido en CalendarView:', schedule);
    // Adaptar el schedule: cada slot se expande a cada hora ocupada, usando el status real
    const adapted = (schedule || []).flatMap((item: any) =>
      (item.slots || []).flatMap((slot: { start: string; end: string; status?: string; _id?: string }, j: number) => {
        const startHour = parseInt(slot.start.split(':')[0], 10);
        const endHour = parseInt(slot.end.split(':')[0], 10);
        // Forzar la fecha a medianoche local para evitar desfases
        const baseDate = new Date(item.date + 'T00:00:00');
        return Array.from({ length: endHour - startHour }, (_, i) => ({
          date: new Date(baseDate),
          hour: startHour + i,
          status: slot.status || 'scheduled',
          slotId: slot._id
        }));
      })
    );
    // Generar todos los bloques posibles para la semana/mes y fusionar con los adaptados para mostrar libres/cancelados
    setClasses(adapted);
    // DEBUG: Mostrar bloques generados para el 8 de mayo de 2025
    const debugBlocks = adapted.filter(b => b.date instanceof Date && b.date.getFullYear() === 2025 && b.date.getMonth() === 4 && b.date.getDate() === 8);
    console.log('Bloques generados para 2025-05-08:', debugBlocks);
  }, [schedule]);

  useEffect(() => {
    console.log('Classes que se pasan a CalendarGrid:', classes);
  }, [classes]);

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

  // Click en bloque libre: agendar
  const handleTimeBlockClick = (block: any) => {
    setSelectedBlock(block);
    if (block.status === 'free') {
      setAddDate(selectedDate);
      setAddHour(block.hour);
      setShowAddModal(true);
    } else {
      setModalMode('view');
      setModalOpen(true);
    }
  };

  const handleAddClass = async () => {
    if (!addDate || startHour === null || endHour === null) return;
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: '67dda5c8448d12032b5d7a76', // TODO: Usar el id real del estudiante logueado
          instructorId: selectedBlock?.instructorId || '681c2566f4e0eb5564f85205', // TODO: Usar el id real del instructor
          date: addDate.toISOString().split('T')[0],
          start: `${startHour.toString().padStart(2, '0')}:00`,
          end: `${endHour.toString().padStart(2, '0')}:00`,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setStartHour(null);
        setEndHour(null);
        if (onScheduleUpdate) await onScheduleUpdate();
      } else {
        alert('This slot is no longer available.');
      }
    } catch (error) {
      alert('Error booking the class');
    }
  };

  // Guardar/agendar clase
  const handleSaveClass = (data: any) => {
    setClasses((prev) => [
      ...prev,
      {
        date: view === 'week'
          ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
          : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), data.day),
        hour: view === 'week' ? data.hour : undefined,
        status: 'scheduled',
      },
    ]);
    setModalOpen(false);
  };

  // Eliminar clase
  const handleDeleteClass = () => {
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
    if (status === 'canceled') status = 'cancelled';
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
        <div className="rounded-3xl border-2 border-[#27ae60] shadow-2xl p-0 bg-transparent">
          <CalendarGrid
            view={view}
            onTimeBlockClick={handleTimeBlockClick}
            selectedDate={selectedDate}
            classes={classes}
          />
        </div>
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
        <div className="p-6">
          {modalMode === 'add' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Schedule Class</h2>
              <button
                className="bg-[#27ae60] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0056b3]"
                onClick={() => handleSaveClass(selectedBlock)}
              >
                Confirm
              </button>
            </div>
          )}
          {modalMode === 'view' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Class Details</h2>
              <pre className="mb-4 bg-gray-100 p-2 rounded">{JSON.stringify(selectedBlock, null, 2)}</pre>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 mr-2"
                onClick={handleDeleteClass}
              >
                Delete
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-400"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </Modal>
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="p-6 text-black">
          <h2 className="text-xl font-bold mb-4">Schedule Class</h2>
          <div className="mb-2">Date: {addDate?.toLocaleDateString()}</div>
          <div className="mb-2">
            <label className="mr-2">Start hour:</label>
            <input type="number" min={6} max={17} value={startHour ?? addHour ?? ''} onChange={e => setStartHour(Number(e.target.value))} className="border rounded p-1 w-16 text-black" />
          </div>
          <div className="mb-4">
            <label className="mr-2">End hour:</label>
            <input type="number" min={6} max={18} value={endHour ?? ((addHour ?? 6) + 1)} onChange={e => setEndHour(Number(e.target.value))} className="border rounded p-1 w-16 text-black" />
          </div>
          <button className="bg-[#27ae60] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0056b3]" onClick={handleAddClass}>Confirm</button>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarView; 