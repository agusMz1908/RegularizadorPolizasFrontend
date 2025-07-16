import React from 'react';
import PolizaWizard from '../components/wizard/PolizaWizard';
import { useNavigate } from 'react-router-dom';

const WizardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = (result: any) => {
    console.log('Póliza creada:', result);
    // Navegar a la página de pólizas o mostrar confirmación
    navigate('/polizas');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <PolizaWizard 
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
};

export default WizardPage;