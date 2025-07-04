import React from 'react';

const LoadingSpinner: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-8">
    {/* SVG volante de auto animado */}
    <svg className="animate-spin h-16 w-16 text-[#0056b3] mb-4" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" stroke="#0056b3" strokeWidth="6" opacity="0.2" />
      <circle cx="32" cy="32" r="20" stroke="#0056b3" strokeWidth="4" fill="none" />
      <circle cx="32" cy="32" r="6" fill="#0056b3" />
      <rect x="29" y="10" width="6" height="16" rx="3" fill="#0056b3" />
      <rect x="29" y="38" width="6" height="16" rx="3" fill="#0056b3" />
      <rect x="10" y="29" width="16" height="6" rx="3" fill="#0056b3" />
      <rect x="38" y="29" width="16" height="6" rx="3" fill="#0056b3" />
    </svg>
    {label && <span className="text-[#0056b3] text-lg font-semibold">{label}</span>}
  </div>
);

export default LoadingSpinner; 