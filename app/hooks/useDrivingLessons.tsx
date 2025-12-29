"use client";

import { useEffect, useState } from "react";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  price: number;
  buttonLabel?: string;
  tag?: string;
  duration?: number; // Agregamos duración para mostrar horas
  media?: string[];
}

const useDrivingLessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error("Failed to fetch lessons");
        const data = await response.json();
        setLessons(data);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      }
    };

    fetchLessons();
  }, []);

  return lessons;
};

export default useDrivingLessons;
