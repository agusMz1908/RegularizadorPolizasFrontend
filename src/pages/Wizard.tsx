import React from 'react';
import PolizaWizardVelneo from '../components/wizard/PolizaWizardVelneo';
import { useNavigate } from 'react-router-dom';
import { PolizaCreateResponseVelneo } from '../types/azure-document-velneo';

const WizardPage: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Maneja la finalización exitosa del wizard
   */
  const handleComplete = (result: PolizaCreateResponseVelneo) => {
    console.log('🎉 Póliza creada exitosamente:', {
      id: result.id,
      numeroPoliza: result.numeroPoliza,
      estado: result.estado,
      fechaCreacion: result.fechaCreacion
    });

    // Mostrar notificación de éxito (opcional)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Póliza creada exitosamente', {
        body: `Póliza ${result.numeroPoliza} creada correctamente`,
        icon: '/favicon.ico'
      });
    }

    // Navegar a la página de pólizas
    navigate('/polizas', {
      state: {
        newPolizaId: result.id,
        message: `Póliza ${result.numeroPoliza} creada exitosamente`
      }
    });
  };

  /**
   * Maneja la cancelación del wizard
   */
  const handleCancel = () => {
    // Confirmar cancelación si el usuario ha avanzado en el proceso
    const confirmCancel = window.confirm(
      '¿Estás seguro de que quieres cancelar? Se perderá el progreso actual.'
    );

    if (confirmCancel) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="wizard-page">
      <PolizaWizardVelneo 
        onComplete={handleComplete}
        onCancel={handleCancel}
        enableDebugMode={import.meta.env.DEV} // Solo en desarrollo
        autoAdvanceSteps={false} // Permitir control manual
      />
    </div>
  );
};

export default WizardPage;