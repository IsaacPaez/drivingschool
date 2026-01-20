"use client";

import { useState, useEffect } from "react";

export interface ClassesContent {
  title: string;
  description: string;
}

interface ClassesPageData {
  _id: string;
  pageType: string;
  classesPage: ClassesContent;
  isActive: boolean;
  order: number;
}

const useClassesContent = () => {
  const [content, setContent] = useState<ClassesContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // Usar la API local del frontend que se conecta directamente a MongoDB
        const response = await fetch('/api/page-content?pageType=classes');

        if (!response.ok) {
          throw new Error("Failed to fetch classes content");
        }

        const data: ClassesPageData = await response.json();
        
        // La API ya devuelve directamente el documento activo
        if (data && data.classesPage) {
          setContent(data.classesPage);
        } else {
          setError("No active classes page found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching classes content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, error };
};

export default useClassesContent;
