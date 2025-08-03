// src/components/wizard/CompanySectionSelector.tsx - ADAPTADO AL SISTEMA DE TEMAS
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Car, ChevronRight, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAvailableCompanies, useAvailableSections } from '../../hooks/useCompaniesAndSection';
import type { CompanyDto, SeccionDto } from '../../types/maestros';

interface CompanySectionSelectorProps {
  onSelect: (company: CompanyDto, section: SeccionDto) => void;
  selectedCompany?: CompanyDto;
  selectedSection?: SeccionDto;
  onBack: () => void;
}

const CompanySectionSelector: React.FC<CompanySectionSelectorProps> = ({
  onSelect,
  selectedCompany,
  selectedSection,
  onBack
}) => {
  const {
    data: companies = [],
    isLoading: loadingCompanies,
    isError: errorCompanies,
    error: companiesError
  } = useAvailableCompanies();

  const {
    data: sectionsRaw = [],
    isLoading: loadingSections,
    isError: errorSections,
    error: sectionsError
  } = useAvailableSections();

  // ✅ FILTRAR AUTO + CASA según el informe
  const sections = sectionsRaw.filter(section => 
    section.seccion !== 'AUTO + CASA'
  );

  const [tempCompany, setTempCompany] = useState<CompanyDto | undefined>(selectedCompany);
  const [tempSection, setTempSection] = useState<SeccionDto | undefined>(selectedSection);

  // Auto-seleccionar la primera opción disponible si no hay selección previa
  useEffect(() => {
    if (!tempCompany && companies.length > 0) {
      setTempCompany(companies[0]);
    }
  }, [companies, tempCompany]);

  useEffect(() => {
    if (!tempSection && sections.length > 0) {
      setTempSection(sections[0]);
    }
  }, [sections, tempSection]);

  const handleContinue = () => {
    if (tempCompany && tempSection) {
      onSelect(tempCompany, tempSection);
    }
  };

  const canContinue = tempCompany && tempSection;
  const isLoading = loadingCompanies || loadingSections;
  const hasError = errorCompanies || errorSections;

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Compañía y Sección</h2>
          <p className="text-lg text-muted-foreground">Cargando opciones disponibles...</p>
        </div>
        
        <div className="flex justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin mb-4" />
            <p className="text-muted-foreground">Obteniendo compañías y secciones...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Compañía y Sección</h2>
        </div>
        
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Error al cargar opciones
          </h3>
          <p className="text-destructive mb-4">
            {companiesError?.message || sectionsError?.message || 'No se pudieron cargar las compañías y secciones'}
          </p>
          <div className="space-x-4">
            <Button variant="outline" onClick={onBack}>
              Volver
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Compañía y Sección
        </h2>
        <p className="text-lg text-muted-foreground">
          Confirma la compañía de seguros y sección
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Selección de Compañía */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Compañía de Seguros
          </h3>
          
          <div className="space-y-3">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                isSelected={tempCompany?.id === company.id}
                onClick={() => setTempCompany(company)}
                isDefaultOption={companies.length === 1}
              />
            ))}
            
            {companies.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay compañías disponibles</p>
              </div>
            )}
          </div>
          
          {/* Info sobre alcance inicial */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Alcance inicial:</strong> Solo BSE disponible. 
              Próximamente se agregarán más compañías.
            </p>
          </div>
        </div>

        {/* Selección de Sección */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Car className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
            Sección
          </h3>
          
          <div className="space-y-3">
            {sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                isSelected={tempSection?.id === section.id}
                onClick={() => setTempSection(section)}
                isDefaultOption={sections.length === 1}
              />
            ))}
            
            {sections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay secciones disponibles</p>
              </div>
            )}
          </div>
          
          {/* Info sobre alcance inicial */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-lg p-3">
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              <strong>Alcance inicial:</strong> Solo AUTOMÓVILES disponible. 
              Se expandirá a otras secciones próximamente.
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de Selección */}
      {tempCompany && tempSection && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-3">Configuración Seleccionada:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-muted-foreground">Compañía:</span>
                <span className="font-medium text-foreground">{tempCompany.alias}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{tempSection.icono}</span>
                <span className="text-muted-foreground">Sección:</span>
                <span className="font-medium text-foreground">{tempSection.seccion}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="min-w-[120px]"
        >
          Volver
        </Button>
        
        <Button
          size="lg"
          disabled={!canContinue}
          onClick={handleContinue}
          className="min-w-[200px]"
        >
          Continuar
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Componente para mostrar cada compañía
interface CompanyCardProps {
  company: CompanyDto;
  isSelected: boolean;
  onClick: () => void;
  isDefaultOption: boolean;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  isSelected,
  onClick,
  isDefaultOption
}) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected 
          ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700" 
          : "hover:border-blue-200 dark:hover:border-blue-800"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{company.alias}</h4>
              <p className="text-sm text-muted-foreground">{company.nombre}</p>
              {isDefaultOption && (
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                  Selección inicial
                </span>
              )}
            </div>
          </div>
          
          {isSelected && (
            <div className="flex items-center justify-center w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para mostrar cada sección
interface SectionCardProps {
  section: SeccionDto;
  isSelected: boolean;
  onClick: () => void;
  isDefaultOption: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  isSelected,
  onClick,
  isDefaultOption
}) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected 
          ? "ring-2 ring-emerald-500 dark:ring-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700" 
          : "hover:border-emerald-200 dark:hover:border-emerald-800"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-xl">
              {section.icono}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{section.seccion}</h4>
              <p className="text-sm text-muted-foreground">ID: {section.id}</p>
              {isDefaultOption && (
                <span className="inline-block mt-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs rounded-full">
                  Selección inicial
                </span>
              )}
            </div>
          </div>
          
          {isSelected && (
            <div className="flex items-center justify-center w-6 h-6 bg-emerald-600 dark:bg-emerald-500 rounded-full">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanySectionSelector;