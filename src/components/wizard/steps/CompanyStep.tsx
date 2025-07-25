import React from 'react';
import { Building2, ArrowRight, Check } from 'lucide-react';
import { Company } from '../../../services/companyService';
import { StepLayout } from '../shared/StepLayout';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface CompanyStepProps {
  // Estado del wizard
  companies: Company[];
  loadingCompanies: boolean;
  selectedCompany: Company | null;
  
  // Acciones
  onCompanySelect: (company: Company) => void;
  onLoadCompanies: () => void;
  onNext: () => void;
  onBack: () => void;
  
  // UI
  isDarkMode: boolean;
}

export const CompanyStep: React.FC<CompanyStepProps> = ({
  companies,
  loadingCompanies,
  selectedCompany,
  onCompanySelect,
  onLoadCompanies,
  onNext,
  onBack,
  isDarkMode
}) => {
  return (
    <StepLayout
      title="Seleccionar Compañía"
      description="Elige la compañía de seguros para la póliza"
      icon={Building2}
      color="emerald"
      isDarkMode={isDarkMode}
      onNext={selectedCompany ? onNext : undefined}
      onBack={onBack}
      nextLabel="Continuar"
      backLabel="Volver a clientes"
      nextDisabled={!selectedCompany}
    >
      <div className="p-8">
        {/* Loading */}
        {loadingCompanies ? (
          <LoadingSpinner 
            message="Cargando compañías..." 
            isDarkMode={isDarkMode}
          />
        ) : (
          <CompanyList
            companies={companies}
            selectedCompany={selectedCompany}
            onSelect={onCompanySelect}
            onReload={onLoadCompanies}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </StepLayout>
  );
};

// ✅ Sub-componente: Lista de compañías
interface CompanyListProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelect: (company: Company) => void;
  onReload: () => void;
  isDarkMode: boolean;
}

const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  selectedCompany,
  onSelect,
  onReload,
  isDarkMode
}) => {
  // Estado sin compañías
  if (companies.length === 0) {
    return (
      <div className="text-center py-16">
        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <Building2 className={`w-12 h-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
        </div>
        <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Sin compañías disponibles
        </h3>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          No se encontraron compañías activas en el sistema
        </p>
        <button
          onClick={onReload}
          className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
        >
          Recargar compañías
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Compañías disponibles
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isDarkMode 
            ? 'bg-emerald-900 text-emerald-200' 
            : 'bg-emerald-100 text-emerald-800'
        }`}>
          {companies.length} compañía{companies.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista de compañías */}
      <div className="space-y-3 max-h-80 sm:max-h-96 lg:max-h-[32rem] xl:max-h-[40rem] overflow-y-auto pr-2">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            isSelected={selectedCompany?.id === company.id}
            onSelect={() => onSelect(company)}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  );
};

// ✅ Sub-componente: Card de compañía
interface CompanyCardProps {
  company: Company;
  isSelected: boolean;
  onSelect: () => void;
  isDarkMode: boolean;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  isSelected,
  onSelect,
  isDarkMode
}) => (
  <div
    onClick={onSelect}
    className={`group relative p-4 border rounded-xl hover:shadow-md cursor-pointer transition-all duration-200 ${
      isDarkMode 
        ? 'border-gray-600 bg-gray-700 hover:border-emerald-500 hover:bg-gray-650' 
        : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
    } ${isSelected 
      ? isDarkMode 
        ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-900/20' 
        : 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50' 
      : ''}`}
  >
    <div className="flex items-center justify-between">
      {/* Información principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-4">
          {/* Icono de compañía */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isSelected 
              ? 'bg-gradient-to-br from-emerald-500 to-blue-600' 
              : isDarkMode 
                ? 'bg-gradient-to-br from-emerald-600 to-blue-700' 
                : 'bg-gradient-to-br from-emerald-500 to-blue-600'
          }`}>
            <Building2 className="w-5 h-5 text-white" />
          </div>

          {/* Datos de la compañía */}
          <div className="flex-1 min-w-0">
            {/* Nombre y código */}
            <div className="flex items-center space-x-3 mb-1">
              <h4 className={`font-bold text-lg truncate ${
                isDarkMode 
                  ? 'text-white group-hover:text-emerald-300' 
                  : 'text-gray-900 group-hover:text-emerald-900'
              } transition-colors`}>
                {company.comnom || company.nombre || `Compañía ${company.id}` || 'Sin nombre'}
              </h4>
              
              {/* Alias como badge si existe */}
              {company.comalias && company.comalias !== company.comnom && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${
                  isDarkMode 
                    ? 'bg-gray-600 text-gray-200' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  <span>Alias:</span>
                  <span>{company.comalias}</span>
                </div>
              )}
            </div>

            {/* Estado y detalles */}
            <div className={`flex items-center space-x-4 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">
                  {company.activo !== false ? 'Activa y verificada' : 'Inactiva'}
                </span>
              </div>
              
              {/* Código si existe */}
              {(company.cod_srvcompanias || company.codigo) && (
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                  }`}></div>
                  <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>
                    {company.cod_srvcompanias || company.codigo}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acción */}
      <div className="flex items-center space-x-3 ml-4">
        {isSelected && (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-green-600' : 'bg-green-500'
          }`}>
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
        <span className={`text-xs font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-500'
        }`}>
          {isSelected ? 'Seleccionada' : 'Seleccionar'}
        </span>
        <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
          isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
        }`} />
      </div>
    </div>
  </div>
);

export default CompanyStep;