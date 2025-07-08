import { useState, useCallback } from 'react';
import { velneoService } from '../services/velneoService'; 
import { PolizaFormData } from '../types/poliza';
import { VelneoPolicyResponse } from '../types/api';

export const useVelneo = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<VelneoPolicyResponse | null>(null);

  const testConnection = useCallback(async () => {
    try {
      const connected = await velneoService.testConnection();
      setIsConnected(connected);
      return connected;
    } catch (err: any) {
      setIsConnected(false);
      setError(err.message);
      return false;
    }
  }, []);

  const sendPoliza = useCallback(async (
    clienteId: number,
    companiaId: number,
    ramoId: number,
    polizaData: PolizaFormData,
    documentoId: string
  ): Promise<VelneoPolicyResponse | null> => {
    setIsSending(true);
    setError(null);
    
    try {
      const response = await velneoService.createPolicy(
        clienteId,
        companiaId,
        ramoId,
        polizaData,
        documentoId
      );
      
      setLastResponse(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsSending(false);
    }
  }, []);

  const updatePoliza = useCallback(async (
    polizaId: string,
    polizaData: PolizaFormData
  ): Promise<VelneoPolicyResponse | null> => {
    setIsSending(true);
    setError(null);
    
    try {
      const response = await velneoService.updatePolicy(polizaId, polizaData);
      setLastResponse(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsSending(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLastResponse(null);
    setIsSending(false);
  }, []);

  return {
    isConnected,
    isSending,
    error,
    lastResponse,
    testConnection,
    sendPoliza,
    updatePoliza,
    clearError,
    reset,
  };
};