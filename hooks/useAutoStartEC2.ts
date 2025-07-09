import { useEffect, useState } from 'react';

interface EC2Status {
  isStarting: boolean;
  isReady: boolean;
  error: string | null;
  publicIp: string | null;
}

export function useAutoStartEC2() {
  const [status, setStatus] = useState<EC2Status>({
    isStarting: false,
    isReady: false,
    error: null,
    publicIp: null
  });

  useEffect(() => {
    const startEC2 = async () => {
      // Evitar múltiples llamadas
      if (status.isStarting || status.isReady) {
        return;
      }

      setStatus(prev => ({ ...prev, isStarting: true, error: null }));
      
      try {
        console.log("🚀 Iniciando EC2 automáticamente...");
        
        const response = await fetch('/api/aws/start-ec2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          console.log("✅ EC2 iniciado correctamente");
          setStatus({
            isStarting: false,
            isReady: true,
            error: null,
            publicIp: data.publicIp || null
          });
        } else {
          console.warn("⚠️ No se pudo iniciar EC2:", data.error);
          setStatus({
            isStarting: false,
            isReady: false,
            error: data.error || "Failed to start EC2",
            publicIp: null
          });
        }
      } catch (error) {
        console.warn("⚠️ Error al intentar iniciar EC2:", error);
        setStatus({
          isStarting: false,
          isReady: false,
          error: error instanceof Error ? error.message : "Network error",
          publicIp: null
        });
      }
    };

    // Iniciar EC2 apenas se monte el componente
    startEC2();
  }, []); // Solo se ejecuta una vez al montar

  return status;
} 