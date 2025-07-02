"use client";

import { useState, useEffect, useCallback } from "react";

interface ClassData {
  ticketClasses: Map<string, any>;
  drivingClasses: Map<string, any>;
  locations: Map<string, any>;
  isLoading: boolean;
}

export function useClassDataCache() {
  const [classData, setClassData] = useState<ClassData>({
    ticketClasses: new Map(),
    drivingClasses: new Map(),
    locations: new Map(),
    isLoading: false
  });

  // Función para precargar todos los datos de las clases cuando se selecciona un instructor
  const preloadClassData = useCallback(async (schedule: any[]) => {
    if (!schedule || schedule.length === 0) return;

    setClassData(prev => ({ ...prev, isLoading: true }));

    try {
      // Extraer todos los ticketClassIds únicos
      const ticketClassIds = new Set<string>();
      schedule.forEach(day => {
        day.slots?.forEach((slot: any) => {
          if (slot.ticketClassId) {
            ticketClassIds.add(slot.ticketClassId);
          }
        });
      });

      if (ticketClassIds.size === 0) {
        setClassData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      console.log(`🚀 Preloading data for ${ticketClassIds.size} classes...`);

      // Cargar todos los ticketClasses en paralelo
      const ticketClassPromises = Array.from(ticketClassIds).map(async (id) => {
        try {
          const res = await fetch(`/api/ticketclasses/${id}`);
          if (res.ok) {
            const data = await res.json();
            return { id, data };
          }
        } catch (error) {
          console.error(`Error fetching ticket class ${id}:`, error);
        }
        return null;
      });

      const ticketClassResults = await Promise.all(ticketClassPromises);
      
      // Extraer classIds y locationIds únicos
      const classIds = new Set<string>();
      const locationIds = new Set<string>();
      const newTicketClasses = new Map();

      ticketClassResults.forEach(result => {
        if (result) {
          newTicketClasses.set(result.id, result.data);
          if (result.data.classId) classIds.add(result.data.classId);
          if (result.data.locationId) locationIds.add(result.data.locationId);
        }
      });

      // Cargar driving classes y locations en paralelo
      const [drivingClassResults, locationResults] = await Promise.all([
        Promise.all(Array.from(classIds).map(async (id) => {
          try {
            const res = await fetch(`/api/drivingclasses/${id}`);
            if (res.ok) {
              const data = await res.json();
              return { id, data };
            }
          } catch (error) {
            console.error(`Error fetching driving class ${id}:`, error);
          }
          return null;
        })),
        Promise.all(Array.from(locationIds).map(async (id) => {
          try {
            const res = await fetch(`/api/locations/${id}`);
            if (res.ok) {
              const data = await res.json();
              return { id, data };
            }
          } catch (error) {
            console.error(`Error fetching location ${id}:`, error);
          }
          return null;
        }))
      ]);

      // Construir los Maps finales
      const newDrivingClasses = new Map();
      const newLocations = new Map();

      drivingClassResults.forEach(result => {
        if (result) newDrivingClasses.set(result.id, result.data);
      });

      locationResults.forEach(result => {
        if (result) newLocations.set(result.id, result.data);
      });

      console.log(`✅ Preloaded: ${newTicketClasses.size} ticket classes, ${newDrivingClasses.size} driving classes, ${newLocations.size} locations`);

      setClassData({
        ticketClasses: newTicketClasses,
        drivingClasses: newDrivingClasses,
        locations: newLocations,
        isLoading: false
      });

    } catch (error) {
      console.error('Error preloading class data:', error);
      setClassData(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Función para obtener información completa de una clase
  const getCompleteClassInfo = useCallback((ticketClassId: string) => {
    const ticketClass = classData.ticketClasses.get(ticketClassId);
    if (!ticketClass) return null;

    const drivingClass = classData.drivingClasses.get(ticketClass.classId);
    const location = classData.locations.get(ticketClass.locationId);

    return {
      ticketClass,
      drivingClass,
      location,
      className: drivingClass?.title || 'Loading...',
      price: drivingClass?.price || 0,
      locationName: location?.title || 'Loading...',
      cupos: ticketClass.cupos || 0,
      registeredCount: ticketClass.students?.length || 0
    };
  }, [classData]);

  const clearCache = useCallback(() => {
    setClassData({
      ticketClasses: new Map(),
      drivingClasses: new Map(),
      locations: new Map(),
      isLoading: false
    });
  }, []);

  return {
    ...classData,
    preloadClassData,
    getCompleteClassInfo,
    clearCache
  };
}
