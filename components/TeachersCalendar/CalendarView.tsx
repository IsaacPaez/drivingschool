'use client';
import React, { useState } from 'react';
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
}

const CalendarView: React.FC<CalendarViewProps> = ({ schedule }) => {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [classes, setClasses] = useState<any[]>(schedule || []);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view');

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
      setModalMode('add');
    } else {
      setModalMode('view');
    }
    setModalOpen(true);
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

  return (
    <div className="flex gap-8 w-full">
      {/* Sidebar izquierda */}
      <aside className="hidden md:flex flex-col w-72 bg-gradient-to-br from-[#e3f6fc] via-[#eafaf1] to-[#d4f1f4] border-l-4 border-[#27ae60] rounded-2xl shadow-2xl p-6 h-fit min-h-[600px] relative overflow-hidden">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#0056b3] mb-2">Calendars</h2>
          <ul className="space-y-2 text-black">
            <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#0056b3]"></span> Work</li>
            <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#27ae60]"></span> Personal</li>
            <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Break</li>
            <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-400"></span> Activities</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0056b3] mb-2">Month</h2>
          <div className="bg-white/70 rounded-lg p-2 text-center text-gray-500 border border-[#27ae60]">
            <MiniCalendar value={selectedDate} onChange={handleMiniCalendarChange} />
          </div>
        </div>
      </aside>
      {/* Calendario central */}
      <main className="flex-1">
        <div className="flex items-center gap-2 mb-4 bg-white/70 rounded-xl shadow p-2 w-fit mx-auto">
          <button onClick={handlePrev} className="p-2 rounded-full bg-[#e3f6fc] hover:bg-[#27ae60] text-[#0056b3] hover:text-white shadow transition-all"><HiChevronLeft size={22} /></button>
          <CalendarToolbar view={view} setView={setView} />
          <button onClick={handleNext} className="p-2 rounded-full bg-[#e3f6fc] hover:bg-[#27ae60] text-[#0056b3] hover:text-white shadow transition-all"><HiChevronRight size={22} /></button>
        </div>
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
      <aside className="hidden lg:flex flex-col w-80 bg-gradient-to-br from-[#e3f6fc] via-[#eafaf1] to-[#d4f1f4] border-r-4 border-[#0056b3] rounded-2xl shadow-2xl p-6 h-fit min-h-[600px] relative overflow-hidden">
        <h2 className="text-lg font-bold text-[#0056b3] mb-4">Tasks</h2>
        <ul className="space-y-3 text-black">
          <li className="flex items-center gap-2"><input type="checkbox" className="accent-[#27ae60]" /> Prepare class</li>
          <li className="flex items-center gap-2"><input type="checkbox" className="accent-[#27ae60]" /> Review students</li>
          <li className="flex items-center gap-2"><input type="checkbox" className="accent-[#27ae60]" /> Update schedule</li>
        </ul>
        <div className="mt-8">
          <h3 className="font-semibold text-[#27ae60] mb-2">Books to read</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Design Patterns</li>
            <li>Lean UX</li>
          </ul>
        </div>
      </aside>
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
    </div>
  );
};

export default CalendarView; 