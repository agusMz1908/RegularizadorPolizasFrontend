import React, { useState, useEffect } from 'react';
import { Save, Check, AlertCircle, Clock } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isDirty: boolean;
  isSubmitting: boolean;
  lastSaved?: Date;
  onSave?: () => void;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isDirty,
  isSubmitting,
  lastSaved,
  onSave,
  className = ''
}) => {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'pending' | 'error'>('saved');

  useEffect(() => {
    if (isSubmitting) {
      setSaveStatus('saving');
    } else if (isDirty) {
      setSaveStatus('pending');
    } else {
      setSaveStatus('saved');
    }
  }, [isDirty, isSubmitting]);

  const getStatusInfo = () => {
    switch (saveStatus) {
      case 'saving':
        return {
          icon: <div className="animate-spin"><Save className="w-4 h-4" /></div>,
          text: 'Guardando...',
          color: 'text-blue-600'
        };
      case 'saved':
        return {
          icon: <Check className="w-4 h-4" />,
          text: lastSaved ? `Guardado ${formatLastSaved(lastSaved)}` : 'Guardado',
          color: 'text-green-600'
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Cambios sin guardar',
          color: 'text-yellow-600'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Error al guardar',
          color: 'text-red-600'
        };
      default:
        return {
          icon: <Save className="w-4 h-4" />,
          text: 'Desconocido',
          color: 'text-gray-600'
        };
    }
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins}m`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;
    
    return date.toLocaleDateString();
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`flex items-center gap-2 text-sm ${statusInfo.color} ${className}`}>
      {statusInfo.icon}
      <span>{statusInfo.text}</span>
      {onSave && saveStatus === 'pending' && (
        <button
          onClick={onSave}
          className="ml-2 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded transition-colors"
        >
          Guardar ahora
        </button>
      )}
    </div>
  );
};