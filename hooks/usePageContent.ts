"use client";

import { useEffect, useState } from "react";
import { PageContent, PageType } from "@/types/pageContent";

interface UsePageContentOptions {
  pageType: PageType;
  fallback?: Partial<PageContent>;
}

interface UsePageContentReturn {
  content: PageContent | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook para obtener contenido dinámico de páginas desde el dashboard
 * 
 * @param options - Configuración del hook
 * @returns Contenido de la página, estado de carga y error
 * 
 * @example
 * ```tsx
 * const { content, loading, error } = usePageContent({
 *   pageType: "home",
 *   fallback: { title: { part1: "Default", part2: "Title" } }
 * });
 * ```
 */
export function usePageContent({
  pageType,
  fallback,
}: UsePageContentOptions): UsePageContentReturn {
  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Usar la API local del frontend
        const response = await fetch(
          `/api/page-content?pageType=${pageType}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          // Si no hay contenido, no es un error crítico
          if (response.status === 404) {
            console.warn(`[usePageContent] No content found for ${pageType}`);
            setContent(null);
            return;
          }
          throw new Error(`Failed to fetch content: ${response.statusText}`);
        }

        const data = await response.json();
        setContent(data);
      } catch (err) {
        console.error(`[usePageContent] Error fetching ${pageType}:`, err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        
        // Si hay fallback, usarlo
        if (fallback) {
          console.warn(`[usePageContent] Using fallback content for ${pageType}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [pageType, fallback]);

  return { content, loading, error };
}

/**
 * Versión de servidor para obtener contenido de página
 * Usar en Server Components
 */
export async function getPageContent(
  pageType: PageType
): Promise<PageContent | null> {
  try {
    // En servidor, construir la URL completa
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/page-content?pageType=${pageType}`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[getPageContent] No content found for ${pageType}`);
        return null;
      }
      throw new Error(`Failed to fetch content: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[getPageContent] Error fetching ${pageType}:`, error);
    return null;
  }
}
