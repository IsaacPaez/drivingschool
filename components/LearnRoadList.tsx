"use client";

import React, { useEffect, useState } from "react";

const LearnRoadList = () => {
  interface LearnRoadItem {
    _id: string;
    title: string;
    description: string;
    price: number;
    buttonLabel?: string;
  }

  const [items, setItems] = useState<LearnRoadItem[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(
          "/api/products?category=Road Skills for Life"
        ); // Filtra "Road Skills for Life"
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching Learn Road items:", error);
      }
    };

    fetchItems();
  }, []);

  return (
    <section
      className="bg-cover bg-center py-20"
      style={{ backgroundImage: "url('/LearnRoad.jpg')" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
        {items.map((item) => (
          <div
            key={item._id}
            className="bg-black bg-opacity-50 shadow-lg p-6 transform transition-transform duration-300 hover:-translate-y-2 rounded-b-lg"
          >
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              {item.title}
            </h3>
            <p className="text-base text-gray-300 mb-4 text-center">
              {item.description}
            </p>
            <p className="text-3xl font-bold text-[#27ae60] mb-6 text-center">
              ${item.price}
            </p>
            <button className="bg-[#27ae60] hover:bg-[#0056b3] text-white font-bold text-lg py-3 px-6 rounded-full w-full transition-colors duration-300">
              {item.buttonLabel || "Learn More"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LearnRoadList;
