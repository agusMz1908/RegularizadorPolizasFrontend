export interface Company {
  id: number;
  comnom: string;              // ← Nombre principal de la compañía
  comrazsoc?: string;
  comruc?: string;
  comdom?: string;
  comtel?: string;
  comfax?: string;
  comsumodia?: string;
  comcntcli?: number;
  comcntcon?: number;
  comprepes?: number;
  compredol?: number;
  comcomipe?: number;
  comcomido?: number;
  comtotcomi?: number;
  comtotpre?: number;
  comalias?: string;           // ← Alias de la compañía
  comlog?: string;
  broker?: boolean;
  cod_srvcompanias?: string;
  no_utiles?: string;
  paq_dias?: number;

  // ✅ CAMPOS CALCULADOS PARA COMPATIBILIDAD CON FormStep
  nombre?: string;             // Alias para comnom
  alias?: string;              // Alias para comalias
  codigo?: string;             // Alias para cod_srvcompanias
  activo?: boolean;            // Campo calculado
}

export interface CompanyLookup {
  id: number;
  comnom: string;
  comalias: string;
  cod_srvcompanias: string;
  
  nombre: string;
  alias: string;
  codigo: string;
}