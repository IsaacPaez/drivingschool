interface PackageSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const PackageSidebar: React.FC<PackageSidebarProps> = ({
  selectedCategory,
  setSelectedCategory,
}) => {
  const categories = [
    "All",
    "Single Lesson",
    "Lesson Packages",
    "Written Test",
  ];

  return (
    <div className="hidden md:block w-1/4 bg-white p-6 border-r shadow-lg">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      <ul className="space-y-3">
        {categories.map((category) => (
          <li key={category}>
            <button
              onClick={() => setSelectedCategory(category)}
              className={`block w-full text-left p-3 rounded-md ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PackageSidebar;
