import React from "react";

interface TicketClass {
  _id: string;
  type: string;
  date: string;
  hour: string;
  duration: string;
}

interface Props {
  ticketClasses: TicketClass[];
}

const StudentBookedClasses: React.FC<Props> = ({ ticketClasses }) => (
  <ul className="divide-y">
    {ticketClasses.map(tc => (
      <li key={tc._id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between">
        <span className="font-semibold text-[#0056b3]">{tc.type}</span>
        <span className="text-xs text-gray-500">{new Date(tc.date).toLocaleDateString()} {tc.hour}</span>
        <span className="text-xs text-gray-500">Duraation: {tc.duration}</span>
      </li>
    ))}
    {ticketClasses.length === 0 && <li className="text-gray-400 py-4">No booked classes</li>}
  </ul>
);

export default StudentBookedClasses; 