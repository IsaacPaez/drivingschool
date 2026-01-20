"use client";

import { useState, useEffect } from 'react';

interface OnlineCoursesContent {
  title?: string;
  description?: string;
}

interface UseOnlineCoursesContentReturn {
  content: OnlineCoursesContent | null;
  loading: boolean;
  error: string | null;
}

export function useOnlineCoursesContent(): UseOnlineCoursesContentReturn {
  const [content, setContent] = useState<OnlineCoursesContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch('/api/page-content?pageType=onlineCourses');
        
        if (!response.ok) {
          throw new Error('Failed to fetch online courses content');
        }

        const data = await response.json();
        
        if (data && data.onlineCoursesPage) {
          setContent(data.onlineCoursesPage);
        }
      } catch (err) {
        console.error('Error fetching online courses content:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  return { content, loading, error };
}
