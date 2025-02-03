"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import AuthenticatedButton from "@/components/AuthenticatedButton"; // ✅ Botón autenticado

const Page: React.FC = () => {
  interface Package {
    _id: string;
    title: string;
    category: string;
    media: string[];
    price: number;
    buttonLabel?: string;
  }

  const [data, setData] = useState<Package[]>([]);

  const [filteredData, setFilteredData] = useState<Package[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
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

  const setSelectedItem = (item: Package) => {
    // Implement the function logic here
    console.log("Selected item:", item);
  };

  return (
    <section className="bg-gray-100 pt-[170px] pb-20 px-4 sm:px-6 md:px-12 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        {/* 📌 SIDEBAR - FILTROS */}
        <motion.div
          className="w-full md:w-1/4 bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Filter</h2>

          <button
            onClick={() => setSelectedCategory("all")}
            className={`w-full text-left py-3 px-5 rounded-lg transition-all duration-200 border text-lg mb-3 ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white font-semibold border-blue-800 shadow-md"
                : "bg-gray-50 text-gray-800 hover:bg-blue-100 border-gray-200"
            }`}
          >
            All
          </button>

          {/* 📌 GENERAR SECCIONES DINÁMICAMENTE SEGÚN CATEGORÍAS */}
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left py-3 px-5 rounded-lg transition-all duration-200 border text-lg mb-3 ${
                selectedCategory === category
                  ? "bg-blue-600 text-white font-semibold border-blue-800 shadow-md"
                  : "bg-gray-50 text-gray-800 hover:bg-blue-100 border-gray-200"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}

          {/* 📌 INPUT DE BÚSQUEDA */}
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

        {/* 📌 RESULTADOS - TARJETAS */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 📌 GRID DE TARJETAS */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredData.map((item) => (
              <motion.div
                key={item._id}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedItem(item)}
              >
                {/* 📌 IMAGEN */}
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
                    <p className="text-gray-500 italic text-sm">
                      No image available
                    </p>
                  )}
                </div>

                {/* 📌 CONTENIDO */}
                <div className="flex-1 flex flex-col justify-between">
                  <h2 className="text-lg font-semibold text-center mt-3 text-gray-900">
                    {item.title}
                  </h2>
                  <p className="text-xl font-bold text-blue-600 mt-2">
                    ${typeof item.price === "number" ? item.price.toFixed(2) : "0.00"}
                  </p>
                </div>

                {/* 📌 BOTÓN DENTRO DE LA TARJETA */}
                <AuthenticatedButton
                  type="buy"
                  actionData={{
                    itemId: item._id,
                    title: item.title,
                    price: item.price,
                  }}
                  label={item.buttonLabel || "Add to Cart"}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Page;
