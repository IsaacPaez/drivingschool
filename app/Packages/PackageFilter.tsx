import React from "react";

interface PackageFilterProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const PackageFilter: React.FC<PackageFilterProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="flex justify-end mb-6">
      <input
        type="text"
        placeholder="Search packages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border px-4 py-2 rounded-md w-full md:w-1/2 focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default PackageFilter;
