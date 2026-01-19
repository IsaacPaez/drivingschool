"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";
import Body from "@/components/Body";
import CorporatePrograms from "@/components/CorporatePrograms";
import Learn from "@/components/Learn";
import DrivingLessons from "@/components/DrivingLessons";
import TrafficCourses from "@/components/TrafficCourses";
import Resources from "@/components/Resources";
import AreasWeServe from "@/components/AreasWeServe";
import AuthRedirector from "@/components/AuthRedirector";
import { useAuth } from "@/components/AuthContext";
import { useAutoStartEC2 } from "@/hooks/useAutoStartEC2";

interface SectionOrder {
  id: string;
  order: number;
}

// Map section IDs to their components
const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  hero: Hero,
  featureSection: Body,
  corporateProgramsSection: CorporatePrograms,
  benefitsSection: Learn,
  drivingLessonsTitle: DrivingLessons,
  trafficCoursesSection: TrafficCourses,
  resources: Resources,
  areasWeServe: AreasWeServe,
};

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [sectionOrder, setSectionOrder] = useState<SectionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Iniciar EC2 automáticamente
  useAutoStartEC2();

  useEffect(() => {
    if (user && user.type === "instructor") {
      router.replace("/myschedule");
    }
  }, [user, router]);

  useEffect(() => {
    // Fetch section order from our own API (which calls the dashboard server-side)
    const fetchSectionOrder = async () => {
      try {
        console.log("🔍 Fetching section order from API...");
        
        const orderRes = await fetch("/api/section-order", {
          cache: "no-store",
        });
        
        console.log("📥 Order response status:", orderRes.status);
        
        if (orderRes.ok) {
          const order = await orderRes.json();
          console.log("✅ Section order fetched:", order);
          
          if (Array.isArray(order) && order.length > 0) {
            setSectionOrder(order);
          } else {
            console.log("⚠️ Empty order, using defaults");
          }
        } else {
          console.log("⚠️ Failed to fetch order, using defaults");
        }
      } catch (error) {
        console.error("❌ Error fetching section order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionOrder();
  }, []);

  // Sort and render sections based on order
  const orderedSections = useMemo(() => {
    console.log("🎨 Computing ordered sections - sectionOrder:", sectionOrder, "loading:", loading);
    
    if (sectionOrder.length === 0 || loading) {
      console.log("📋 Using default section order");
      // Return default order if no custom order is set
      return [
        { id: "hero", Component: Hero },
        { id: "featureSection", Component: Body },
        { id: "corporateProgramsSection", Component: CorporatePrograms },
        { id: "benefitsSection", Component: Learn },
        { id: "drivingLessonsTitle", Component: DrivingLessons },
        { id: "trafficCoursesSection", Component: TrafficCourses },
        { id: "resources", Component: Resources },
        { id: "areasWeServe", Component: AreasWeServe },
      ];
    }

    // Sort sections based on saved order
    const ordered = sectionOrder
      .sort((a, b) => a.order - b.order)
      .map((section) => ({
        id: section.id,
        Component: SECTION_COMPONENTS[section.id],
      }))
      .filter((section) => section.Component); // Filter out any undefined components
    
    console.log("✅ Using custom section order:", ordered.map(s => s.id));
    return ordered;
  }, [sectionOrder, loading]);

  return (
    <>
      <AuthRedirector />
      <div>
        {orderedSections.map(({ id, Component }) => (
          <Component key={id} />
        ))}
      </div>
    </>
  );
}
