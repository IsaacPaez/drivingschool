import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
  isLoading: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected, error, isLoading }) => {
  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Conectando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center space-x-2">
          <span className="text-lg">⚠️</span>
          <div>
            <div className="font-semibold">Error de Conexión</div>
            <div className="text-sm opacity-90">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="text-lg">✅</span>
          <span>Conectado</span>
        </div>
      </div>
    );
  }

  return null;
};

export default ConnectionStatus; 