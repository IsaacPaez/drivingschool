import React from 'react';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
}

interface Props {
  students: Student[];
  filtered: Student[];
  search: string;
  setSearch: (s: string) => void;
  handleSelect: (s: Student) => void;
  handleOpenSingleMail: (email: string) => void;
  loadingStudents: boolean;
}

const StudentList: React.FC<Props> = ({ students, filtered, search, setSearch, handleSelect, handleOpenSingleMail, loadingStudents }) => {
  if (loadingStudents) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <svg className="animate-spin h-12 w-12 text-[#0056b3] mb-4" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" stroke="#0056b3" strokeWidth="6" opacity="0.2" />
          <path d="M32 8a24 24 0 1 1 0 48a24 24 0 1 1 0-48zm0 0v12m0 24v12m-17-17h12m24 0h12M16.93 16.93l8.49 8.49m12.12 12.12l8.49 8.49M16.93 47.07l8.49-8.49m12.12-12.12l8.49-8.49" stroke="#0056b3" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="32" r="6" fill="#0056b3" />
        </svg>
        <span className="text-[#0056b3] text-lg font-semibold">Loading...</span>
      </div>
    );
  }
  return (
    <aside className="w-1/3 bg-white rounded-3xl shadow-2xl p-6 border border-[#e0e0e0]">
      <input
        type="text"
        placeholder="Search by name, ID or DNI..."
        className="w-full mb-4 p-2 border rounded text-black placeholder:text-gray-400"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <ul className="divide-y">
        {filtered.map(s => (
          <li key={s._id} className="py-3 cursor-pointer hover:bg-blue-50 rounded flex items-center justify-between" onClick={() => handleSelect(s)}>
            <div>
              <div className="font-semibold text-[#0056b3]">{s.firstName} {s.lastName}</div>
              <div className="text-xs text-gray-500">{s.email}</div>
              <div className="text-xs text-gray-500">DNI: {s.dni}</div>
            </div>
            <button
              className="ml-2 flex items-center justify-center bg-white border border-[#ea4335] text-[#ea4335] rounded-full p-2 hover:bg-[#ea4335] hover:text-white transition-all"
              title={`Send email to ${s.firstName}`}
              onClick={e => { e.stopPropagation(); handleOpenSingleMail(s.email); }}
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="24" fill="#fff"/>
                <path d="M8 16l16 12 16-12" stroke="#ea4335" strokeWidth="3" strokeLinejoin="round"/>
                <rect x="8" y="16" width="32" height="16" rx="3" stroke="#ea4335" strokeWidth="3"/>
              </svg>
            </button>
          </li>
        ))}
        {filtered.length === 0 && <li className="text-gray-400 py-4">No students found</li>}
      </ul>
    </aside>
  );
};

export default StudentList; 