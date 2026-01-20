"use client";

import { useState, useEffect } from 'react';

interface DrivingTestInfoBox {
  title: string;
  points: string[];
}

interface DrivingTestContent {
  title?: string;
  cta?: {
    text: string;
    link: string;
  };
  subtitle?: string;
  description?: string;
  infoBoxes?: DrivingTestInfoBox[];
  image?: string;
}

interface UseDrivingTestContentReturn {
  content: DrivingTestContent | null;
  loading: boolean;
  error: string | null;
}

export function useDrivingTestContent(): UseDrivingTestContentReturn {
  const [content, setContent] = useState<DrivingTestContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch('/api/page-content?pageType=drivingTest');
        
        if (!response.ok) {
          throw new Error('Failed to fetch driving test content');
        }

        const data = await response.json();
        
        if (data && data.drivingTestPage) {
          setContent(data.drivingTestPage);
        }
      } catch (err) {
        console.error('Error fetching driving test content:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  return { content, loading, error };
}
