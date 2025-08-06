// src/components/wizard/CompanySectionSelector.tsx - CON ANIMACIONES SUAVES
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Car, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Shield,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAvailableCompanies, useAvailableSections } from '../../hooks/useCompaniesAndSection';
import type { CompanyDto, SeccionDto } from '@/types/masterData';

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

  // ✅ LOADING STATE CON ANIMACIONES SUAVES
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
          <div className="relative inline-block">
            <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Compañía y Sección
          </h2>
          <p className="text-lg text-muted-foreground">Cargando opciones disponibles...</p>
        </div>
        
        <div className="flex justify-center py-12 animate-in fade-in-0 duration-700 delay-300">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <Shield className="absolute inset-0 w-6 h-6 m-auto text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">Obteniendo compañías y secciones...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ERROR STATE CON ANIMACIONES SUAVES
  if (hasError) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Compañía y Sección
          </h2>
        </div>
        
        <div className="text-center py-12 animate-in fade-in-0 duration-400">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4 animate-pulse" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Error al cargar opciones
          </h3>
          <p className="text-destructive mb-4">
            {companiesError?.message || sectionsError?.message || 'No se pudieron cargar las compañías y secciones'}
          </p>
          <div className="space-x-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="transition-all duration-300 hover:scale-105"
            >
              Volver
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
              className="transition-all duration-300 hover:scale-105"
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
      {/* ✅ HEADER CON ANIMACIÓN SUAVE */}
      <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
        <div className="relative inline-block">
          <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Compañía y Sección
        </h2>
        <p className="text-lg text-muted-foreground">
          Confirma la compañía de seguros y sección
        </p>
      </div>

      {/* ✅ GRID PRINCIPAL CON ANIMACIÓN ESCALONADA SUAVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* ✅ SELECCIÓN DE COMPAÑÍA CON ANIMACIÓN */}
        <div className="space-y-4 animate-in slide-in-from-left-4 duration-500 delay-200">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Compañía de Seguros
          </h3>
          
          <div className="space-y-3">
            {companies.map((company, index) => (
              <div
                key={company.id}
                className="animate-in fade-in-0 slide-in-from-bottom-2 duration-400"
                style={{ animationDelay: `${(index * 100) + 400}ms` }}
              >
                <CompanyCard
                  company={company}
                  isSelected={tempCompany?.id === company.id}
                  onClick={() => setTempCompany(company)}
                  isDefaultOption={companies.length === 1}
                />
              </div>
            ))}
            
            {companies.length === 0 && (
              <div className="text-center py-8 text-muted-foreground animate-in fade-in-0 duration-400">
                <p>No hay compañías disponibles</p>
              </div>
            )}
          </div>
          
          {/* ✅ INFO SOBRE ALCANCE CON ANIMACIÓN */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3 animate-in fade-in-0 duration-400 delay-500">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Alcance inicial:</strong> Solo BSE disponible. 
              Próximamente se agregarán más compañías.
            </p>
          </div>
        </div>

        {/* ✅ SELECCIÓN DE SECCIÓN CON ANIMACIÓN */}
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-500 delay-300">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Car className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
            Sección
          </h3>
          
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="animate-in fade-in-0 slide-in-from-bottom-2 duration-400"
                style={{ animationDelay: `${(index * 100) + 500}ms` }}
              >
                <SectionCard
                  section={section}
                  isSelected={tempSection?.id === section.id}
                  onClick={() => setTempSection(section)}
                  isDefaultOption={sections.length === 1}
                />
              </div>
            ))}
            
            {sections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground animate-in fade-in-0 duration-400">
                <p>No hay secciones disponibles</p>
              </div>
            )}
          </div>
          
          {/* ✅ INFO SOBRE ALCANCE CON ANIMACIÓN */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-lg p-3 animate-in fade-in-0 duration-400 delay-600">
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              <strong>Alcance inicial:</strong> Solo AUTOMÓVILES disponible. 
              Se expandirá a otras secciones próximamente.
            </p>
          </div>
        </div>
      </div>

      {/* ✅ RESUMEN DE SELECCIÓN CON ANIMACIÓN */}
      {tempCompany && tempSection && (
        <div className="max-w-2xl mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-700">
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 border border-border rounded-lg p-4 backdrop-blur-sm">
            <h4 className="font-medium text-foreground mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              Configuración Seleccionada:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-muted-foreground">Compañía:</span>
                <span className="font-medium text-foreground">{tempCompany.alias}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Sección:</span>
                <span className="font-medium text-foreground">{tempSection.seccion}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NAVIGATION BUTTONS CON ANIMACIÓN */}
      <div className="flex justify-between pt-6 animate-in fade-in-0 duration-400 delay-800">
        <Button
          variant="outline"
          onClick={onBack}
          className="min-w-[120px] transition-all duration-300 hover:scale-105"
        >
          Volver
        </Button>
        
        <Button
          size="lg"
          disabled={!canContinue}
          onClick={handleContinue}
          className={cn(
            "min-w-[200px] transition-all duration-300",
            canContinue && "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 hover:scale-105"
          )}
        >
          Continuar
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ✅ COMPANY CARD CON ANIMACIONES MEJORADAS
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
        // ✅ ANIMACIONES SUAVES DE HOVER
        "cursor-pointer transition-all duration-300 hover:shadow-lg group",
        "hover:scale-[1.02] active:scale-[0.98]",
        isSelected 
          ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700 shadow-lg scale-[1.02]" 
          : "hover:border-blue-200 dark:hover:border-blue-800 border-border"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* ✅ ICONO CON ANIMACIÓN SUAVE */}
            <div className={cn(
              "p-2 rounded-lg transition-all duration-300 group-hover:scale-110",
              "bg-blue-100 dark:bg-blue-900/30"
            )}>
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className={cn(
                "font-semibold transition-colors duration-300",
                isSelected ? "text-blue-600 dark:text-blue-400" : "text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400"
              )}>
                {company.alias}
              </h4>
              <p className="text-sm text-muted-foreground">{company.nombre}</p>
              {isDefaultOption && (
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full animate-in fade-in-0 duration-300">
                  Selección inicial
                </span>
              )}
            </div>
          </div>
          
          {/* ✅ CHECK INDICATOR CON ANIMACIÓN */}
          {isSelected && (
            <div className="flex items-center justify-center w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full animate-in scale-in duration-300">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ✅ SECTION CARD CON ANIMACIONES MEJORADAS
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
        // ✅ ANIMACIONES SUAVES DE HOVER
        "cursor-pointer transition-all duration-300 hover:shadow-lg group",
        "hover:scale-[1.02] active:scale-[0.98]",
        isSelected 
          ? "ring-2 ring-emerald-500 dark:ring-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700 shadow-lg scale-[1.02]" 
          : "hover:border-emerald-200 dark:hover:border-emerald-800 border-border"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h4 className={cn(
                "font-semibold transition-colors duration-300",
                isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
              )}>
                {section.seccion}
              </h4>
              <p className="text-sm text-muted-foreground">ID: {section.id}</p>
              {isDefaultOption && (
                <span className="inline-block mt-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs rounded-full animate-in fade-in-0 duration-300">
                  Selección inicial
                </span>
              )}
            </div>
          </div>
          
          {/* ✅ CHECK INDICATOR CON ANIMACIÓN */}
          {isSelected && (
            <div className="flex items-center justify-center w-6 h-6 bg-emerald-600 dark:bg-emerald-500 rounded-full animate-in scale-in duration-300">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanySectionSelector;