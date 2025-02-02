"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";

const Page: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/packages");
        const rawData = await res.json();

        if (Array.isArray(rawData)) {
          setData(rawData);
          setFilteredData(rawData);

          // Obtener categorías únicas
          const uniqueCategories = Array.from(
            new Set(rawData.map((item) => item.category?.toLowerCase()))
          );
          setCategories(uniqueCategories);
        }
      } catch {}
    };
    fetchData();
  }, []);

  // Filtrar resultados según búsqueda y categoría seleccionada
  useEffect(() => {
    let filtered = data;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredData(filtered);
  }, [searchQuery, selectedCategory, data]);

  return (
    <section className="bg-gray-100 pt-[170px] pb-20 px-4 sm:px-6 md:px-12 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        {/* Sidebar - Filtros */}
        <motion.div
          className="w-full md:w-1/4 bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Filter</h2>

          <button
            onClick={() => setSelectedCategory("all")}
            className={`w-full text-left py-3 px-5 rounded-lg transition-all duration-200 border text-lg ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white font-semibold border-blue-800 shadow-md"
                : "bg-gray-50 text-gray-800 hover:bg-blue-100 border-gray-200"
            }`}
          >
            All
          </button>

          {/* Generar secciones dinámicamente según categorías */}
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left py-3 px-5 rounded-lg transition-all duration-200 border text-lg ${
                selectedCategory === category
                  ? "bg-blue-600 text-white font-semibold border-blue-800 shadow-md"
                  : "bg-gray-50 text-gray-800 hover:bg-blue-100 border-gray-200"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}

          {/* Input de búsqueda */}
          <div className="mt-6 relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <FaSearch className="absolute right-3 top-3 text-gray-500" />
          </div>
        </motion.div>

        {/* Resultados - Tarjetas */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Grid de tarjetas */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredData.map((item) => (
              <motion.div
                key={item._id}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between min-h-[500px] cursor-pointer hover:shadow-lg transition"
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedItem(item)} // Abrir popup
              >
                {/* Imagen */}
                <div className="relative w-full h-44 flex justify-center">
                  {item.media && item.media.length > 0 ? (
                    <Image
                      src={item.media[0]}
                      alt={item.title}
                      width={200}
                      height={150}
                      className="rounded-lg object-cover w-full h-full"
                    />
                  ) : (
                    <p className="text-gray-500 italic text-sm">No image available</p>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 flex flex-col justify-between">
                  <h2 className="text-lg font-semibold text-center mt-3 text-gray-900">
                    {item.title}
                  </h2>
                  <p className="text-xl font-bold text-blue-600 mt-2">${item.price.toFixed(2)}</p>
                </div>

                {/* Botón dentro de la tarjeta */}
                <button
                  className="mt-4 bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition text-lg w-full"
                >
                  {item.buttonLabel || "Add to Cart"}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Popup modal */}
      {selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setSelectedItem(null)}
            >
              <FaTimes size={24} />
            </button>

            {/* Imagen en el popup */}
            {selectedItem.media && selectedItem.media.length > 0 && (
              <Image
                src={selectedItem.media[0]}
                alt={selectedItem.title}
                width={400}
                height={250}
                className="rounded-lg object-cover w-full mb-4"
              />
            )}

            <h2 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h2>
            <p className="text-lg text-gray-700 mt-2">${selectedItem.price.toFixed(2)}</p>

            <button className="mt-4 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full">
              {selectedItem.buttonLabel || "Add to Cart"}
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default Page;
