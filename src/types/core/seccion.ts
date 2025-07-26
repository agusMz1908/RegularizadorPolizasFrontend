export interface Seccion {
  id: number;
  seccion: string;             // ← Nombre de la sección
  icono?: string;              // ← Icono de la sección

  // ✅ CAMPOS CALCULADOS PARA COMPATIBILIDAD CON FormStep
  nombre?: string;             // Alias para seccion
  codigo?: string;             // Campo calculado basado en seccion
  descripcion?: string;        // Campo opcional
  activo?: boolean;            // Campo calculado
}

export interface SeccionLookup {
  id: number;
  seccion: string;
  descripcion?: string;
  icono?: string;
  activo: boolean;
}