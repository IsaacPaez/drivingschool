import { useState, useEffect } from 'react';
import { Class as CalendarClass, TimeSlot } from './types';

export const useCalendarState = (initialClasses: CalendarClass[]) => {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<CalendarClass | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [classes, setClasses] = useState<CalendarClass[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [classFilter, setClassFilter] = useState<'scheduled' | 'cancelled' | 'free'>('scheduled');
  const [studentInfo, setStudentInfo] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const adapted = (initialClasses || []).flatMap((item: CalendarClass) =>
      (item.slots || []).map((slot: TimeSlot) => ({
        id: slot && slot._id && typeof slot._id === 'object' && '$oid' in slot._id
          ? String(slot._id.$oid)
          : slot && slot._id
            ? String(slot._id)
            : '',
        date: new Date(item.date),
        hour: parseInt(slot.start.split(':')[0], 10),
        status: (slot.status === 'canceled' ? 'cancelled' : slot.status || 'free') as CalendarClass['status'],
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

  return {
    view,
    setView,
    modalOpen,
    setModalOpen,
    selectedBlock,
    setSelectedBlock,
    selectedDate,
    setSelectedDate,
    classes,
    showAddModal,
    setShowAddModal,
    classFilter,
    setClassFilter,
    studentInfo
  };
}; 