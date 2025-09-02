// Real-time updates via SSE for ALL instructors (not just selected one)
useEffect(() => {
  if (instructors.length === 0) return;

  // Connect to SSE for ALL instructors to receive updates from any of them
  const connections: EventSource[] = [];
  
  instructors.forEach(instructor => {
    const instructorId = instructor._id;
    console.log(`🔌 Connecting to SSE for instructor ${instructorId} (${instructor.name})`);
    const es = new EventSource(`/api/driving-lessons/sse?id=${instructorId}`);

    es.onopen = () => {
      console.log(`✅ SSE connection opened for instructor ${instructorId}`);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data || data.type === 'ping' || data.type === 'connected') return;
        console.log(`📡 SSE message received for ${instructor.name}:`, data);

        if (data?.type === 'slots-updated' && Array.isArray(data.slotIds)) {
          const { instructorId: srcId, slotIds, newStatus, studentId, studentName } = data as {
            instructorId: string;
            slotIds: string[];
            newStatus: string;
            studentId?: string;
            studentName?: string;
          };
          console.log(`🔄 Updating slots in UI for instructor ${srcId}:`, { slotIds, newStatus, studentId, studentName });

          setInstructors(prev => prev.map(instr => {
            // Update by the instructor the event refers to
            if (instr._id !== srcId || !instr.schedule_driving_lesson) return instr;
            
            const updated = instr.schedule_driving_lesson.map((entry: ScheduleEntry) => {
              const idStr = (entry._id || '').toString();
              if (slotIds.includes(idStr)) {
                console.log(`🔄 Updating slot ${idStr} from ${entry.status} to ${newStatus}`);
                return { 
                  ...entry, 
                  status: newStatus, 
                  studentId: studentId ?? entry.studentId, 
                  studentName: studentName ?? entry.studentName 
                };
              }
              return entry;
            });
            
            console.log(`✅ Updated instructor ${instr.name} schedule`);
            return { ...instr, schedule_driving_lesson: updated, lastUpdated: Date.now() };
          }));
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    es.onerror = (error) => {
      console.error(`❌ SSE error for instructor ${instructorId}:`, error);
      try { es.close(); } catch {}
    };

    connections.push(es);
  });

  return () => {
    console.log(`🔌 Closing ${connections.length} SSE connections`);
    connections.forEach(es => {
      try { es.close(); } catch {}
    });
  };
}, [instructors]); // Depend on instructors array to reconnect when it changes
