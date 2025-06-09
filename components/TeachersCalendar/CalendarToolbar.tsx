import React from 'react';

type Props = {
  view: 'week' | 'month' | 'day';
  setView: (view: 'week' | 'month' | 'day') => void;
};

const CalendarToolbar: React.FC<Props> = ({ view, setView }) => {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <button
        onClick={() => setView('week')}
        style={{ background: view === 'week' ? '#007bff' : '#eee', color: view === 'week' ? '#fff' : '#333', padding: '8px 16px', border: 'none', borderRadius: 4 }}
      >
        Week
      </button>
      <button
        onClick={() => setView('month')}
        style={{ background: view === 'month' ? '#007bff' : '#eee', color: view === 'month' ? '#fff' : '#333', padding: '8px 16px', border: 'none', borderRadius: 4 }}
      >
        Month
      </button>
    </div>
  );
};

export default CalendarToolbar; 