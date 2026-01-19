"use client";

import { useState, useEffect } from "react";

export interface LessonsCard {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  buttonColor: string;
}

export interface LessonsContent {
  title: {
    part1: string;
    part2: string;
    part3: string;
  };
  description: string;
  mainImage: string;
  cards: LessonsCard[];
}

interface LessonsPageData {
  _id: string;
  pageType: string;
  lessonsPage: LessonsContent;
  isActive: boolean;
  order: number;
}

const useLessonsContent = () => {
  const [content, setContent] = useState<LessonsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // Usar la API local del frontend que se conecta directamente a MongoDB
        const response = await fetch('/api/page-content?pageType=lessons');

        if (!response.ok) {
          throw new Error("Failed to fetch lessons content");
        }

        const data: LessonsPageData = await response.json();
        
        // La API ya devuelve directamente el documento activo
        if (data && data.lessonsPage) {
          setContent(data.lessonsPage);
        } else {
          setError("No active lessons page found");
        }
      } catch (err) {
        console.error("[LESSONS_CONTENT_ERROR]", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, error };
};

export default useLessonsContent;
