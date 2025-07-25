export const URUGUAY_CONFIG = {
  timezone: 'America/Montevideo',
  locale: 'es-UY',
  dateFormat: 'dd/MM/yyyy',
  dateTimeFormat: 'dd/MM/yyyy HH:mm',
  firstDayOfWeek: 1 // Lunes
};

/**
 * Formatos de fecha comunes en Uruguay
 */
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',           // 25/07/2025
  LONG: 'dd \'de\' MMMM \'de\' yyyy',  // 25 de julio de 2025
  ISO: 'yyyy-MM-dd',             // 2025-07-25
  TIMESTAMP: 'dd/MM/yyyy HH:mm', // 25/07/2025 14:30
  VELNEO: 'yyyy-MM-dd',          // Formato para Velneo
  DISPLAY: 'dd/MM/yyyy',         // Para mostrar al usuario
  API: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'' // Para APIs
};

// ============================================================================
// 📅 FUNCIONES DE FORMATEO
// ============================================================================

/**
 * Formatea una fecha al formato uruguayo estándar (dd/MM/yyyy)
 */
export function formatDateUY(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString(URUGUAY_CONFIG.locale, {
    timeZone: URUGUAY_CONFIG.timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Formatea una fecha para mostrar en formato largo
 */
export function formatDateLongUY(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString(URUGUAY_CONFIG.locale, {
    timeZone: URUGUAY_CONFIG.timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formatea fecha y hora en formato uruguayo
 */
export function formatDateTimeUY(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleString(URUGUAY_CONFIG.locale, {
    timeZone: URUGUAY_CONFIG.timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea una fecha para Velneo (formato ISO: yyyy-MM-dd)
 */
export function formatDateForVelneo(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toISOString().split('T')[0];
}

/**
 * Formatea fecha para APIs (ISO 8601 completo)
 */
export function formatDateForAPI(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toISOString();
}

/**
 * Formatea fecha relativa (hace X días, en X días)
 */
export function formatRelativeDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  const now = new Date();
  const diffInDays = Math.floor((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Hoy';
  if (diffInDays === 1) return 'Mañana';
  if (diffInDays === -1) return 'Ayer';
  if (diffInDays > 1) return `En ${diffInDays} días`;
  if (diffInDays < -1) return `Hace ${Math.abs(diffInDays)} días`;
  
  return formatDateUY(dateObj);
}

// ============================================================================
// 🔄 FUNCIONES DE PARSING
// ============================================================================

/**
 * Parsea una fecha desde formato uruguayo (dd/MM/yyyy)
 */
export function parseDateFromUY(dateString: string): Date | null {
  if (!dateString) return null;
  
  // Limpiar la entrada
  const cleaned = dateString.replace(/[^\d\/]/g, '');
  
  // Patrones de fecha uruguayos
  const patterns = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,     // dd/MM/yyyy
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,      // dd-MM-yyyy
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/     // dd.MM.yyyy
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const [, day, month, year] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Verificar que la fecha es válida
      if (date.getFullYear() == parseInt(year) &&
          date.getMonth() == parseInt(month) - 1 &&
          date.getDate() == parseInt(day)) {
        return date;
      }
    }
  }
  
  // Intentar parsing estándar como fallback
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Parsea fecha desde múltiples formatos
 */
export function parseFlexibleDate(input: string): Date | null {
  if (!input) return null;
  
  // Intentar formato uruguayo primero
  let date = parseDateFromUY(input);
  if (date) return date;
  
  // Intentar formato ISO
  date = new Date(input);
  if (!isNaN(date.getTime())) return date;
  
  // Intentar con diferentes separadores
  const variations = [
    input.replace(/\./g, '/'),
    input.replace(/-/g, '/'),
    input.replace(/\s/g, '/'),
    input.replace(/[^\d]/g, '/').replace(/\/+/g, '/')
  ];
  
  for (const variation of variations) {
    date = parseDateFromUY(variation);
    if (date) return date;
  }
  
  return null;
}

// ============================================================================
// 🧮 OPERACIONES CON FECHAS
// ============================================================================

/**
 * Agrega días a una fecha
 */
export function addDays(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
}

/**
 * Agrega meses a una fecha
 */
export function addMonths(date: Date | string, months: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setMonth(dateObj.getMonth() + months);
  return dateObj;
}

/**
 * Agrega años a una fecha
 */
export function addYears(date: Date | string, years: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setFullYear(dateObj.getFullYear() + years);
  return dateObj;
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
export function diffInDays(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calcula la diferencia en meses entre dos fechas
 */
export function diffInMonths(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
}

/**
 * Calcula la diferencia en años entre dos fechas
 */
export function diffInYears(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return d2.getFullYear() - d1.getFullYear();
}

/**
 * Calcula la edad basada en la fecha de nacimiento
 */
export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// ============================================================================
// 📊 VALIDACIONES DE FECHAS
// ============================================================================

/**
 * Valida si una fecha es válida
 */
export function isValidDate(date: any): boolean {
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Valida si una fecha está en el pasado
 */
export function isInPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Valida si una fecha está en el futuro
 */
export function isInFuture(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Valida si una fecha está dentro de un rango
 */
export function isInRange(date: Date | string, startDate: Date | string, endDate: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return d >= start && d <= end;
}

/**
 * Valida si una fecha es hoy
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.getDate() === today.getDate() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getFullYear() === today.getFullYear();
}

/**
 * Valida si una fecha es fin de semana
 */
export function isWeekend(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const day = dateObj.getDay();
  return day === 0 || day === 6; // Domingo o Sábado
}

// ============================================================================
// 🏢 FECHAS DE NEGOCIO ESPECÍFICAS PARA SEGUROS
// ============================================================================

/**
 * Calcula la fecha de vencimiento estándar (1 año desde inicio)
 */
export function calculateDefaultExpiryDate(startDate: Date | string): Date {
  return addYears(startDate, 1);
}

/**
 * Calcula la fecha de renovación (30 días antes del vencimiento)
 */
export function calculateRenewalDate(expiryDate: Date | string): Date {
  return addDays(expiryDate, -30);
}

/**
 * Valida vigencia de póliza según reglas de negocio
 */
export function validatePolicyDates(
  startDate: Date | string, 
  endDate: Date | string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const today = new Date();
  
  // Validar que las fechas son válidas
  if (!isValidDate(start)) {
    errors.push('Fecha de inicio inválida');
  }
  if (!isValidDate(end)) {
    errors.push('Fecha de vencimiento inválida');
  }
  
  if (isValidDate(start) && isValidDate(end)) {
    // La fecha de fin debe ser posterior al inicio
    if (end <= start) {
      errors.push('La fecha de vencimiento debe ser posterior a la fecha de inicio');
    }
    
    // La vigencia no puede ser mayor a 2 años
    if (diffInYears(start, end) > 2) {
      errors.push('La vigencia no puede ser mayor a 2 años');
    }
    
    // La fecha de inicio no puede ser muy antigua (más de 1 año en el pasado)
    if (diffInDays(start, today) < -365) {
      errors.push('La fecha de inicio no puede ser mayor a 1 año en el pasado');
    }
    
    // La fecha de inicio no puede ser muy futura (más de 3 meses)
    if (diffInDays(today, start) > 90) {
      errors.push('La fecha de inicio no puede ser mayor a 3 meses en el futuro');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Obtiene el próximo día hábil (excluyendo fines de semana)
 */
export function getNextBusinessDay(date: Date | string): Date {
  let nextDay = addDays(date, 1);
  
  while (isWeekend(nextDay)) {
    nextDay = addDays(nextDay, 1);
  }
  
  return nextDay;
}

/**
 * Calcula días hábiles entre dos fechas
 */
export function getBusinessDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  let businessDays = 0;
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    if (!isWeekend(currentDate)) {
      businessDays++;
    }
    currentDate = addDays(currentDate, 1);
  }
  
  return businessDays;
}

// ============================================================================
// 🇺🇾 FERIADOS URUGUAYOS
// ============================================================================

/**
 * Feriados fijos en Uruguay
 */
const FIXED_HOLIDAYS = [
  { month: 1, day: 1, name: 'Año Nuevo' },
  { month: 5, day: 1, name: 'Día de los Trabajadores' },
  { month: 5, day: 18, name: 'Batalla de Las Piedras' },
  { month: 7, day: 18, name: 'Día de la Constitución' },
  { month: 8, day: 25, name: 'Día de la Independencia' },
  { month: 10, day: 12, name: 'Día de la Raza' },
  { month: 11, day: 2, name: 'Día de los Difuntos' },
  { month: 12, day: 25, name: 'Navidad' }
];

/**
 * Calcula Pascua para un año dado (algoritmo de Gauss)
 */
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

/**
 * Obtiene todos los feriados para un año específico
 */
export function getHolidays(year: number): Date[] {
  const holidays: Date[] = [];
  
  // Feriados fijos
  FIXED_HOLIDAYS.forEach(holiday => {
    holidays.push(new Date(year, holiday.month - 1, holiday.day));
  });
  
  // Feriados móviles basados en Pascua
  const easter = calculateEaster(year);
  
  // Carnaval (47 y 48 días antes de Pascua)
  holidays.push(addDays(easter, -48)); // Lunes de Carnaval
  holidays.push(addDays(easter, -47)); // Martes de Carnaval
  
  // Semana Santa
  holidays.push(addDays(easter, -2)); // Viernes Santo
  
  return holidays.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Verifica si una fecha es feriado en Uruguay
 */
export function isHoliday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const holidays = getHolidays(dateObj.getFullYear());
  
  return holidays.some(holiday => 
    holiday.getDate() === dateObj.getDate() &&
    holiday.getMonth() === dateObj.getMonth() &&
    holiday.getFullYear() === dateObj.getFullYear()
  );
}

/**
 * Obtiene el próximo día laborable (excluyendo fines de semana y feriados)
 */
export function getNextWorkDay(date: Date | string): Date {
  let nextDay = addDays(date, 1);
  
  while (isWeekend(nextDay) || isHoliday(nextDay)) {
    nextDay = addDays(nextDay, 1);
  }
  
  return nextDay;
}

// ============================================================================
// 🎯 UTILIDADES DE FECHA PARA UI
// ============================================================================

/**
 * Obtiene rangos de fecha comunes para filtros
 */
export function getCommonDateRanges(): Record<string, { start: Date; end: Date; label: string }> {
  const today = new Date();
  
  return {
    today: {
      start: today,
      end: today,
      label: 'Hoy'
    },
    yesterday: {
      start: addDays(today, -1),
      end: addDays(today, -1),
      label: 'Ayer'
    },
    thisWeek: {
      start: addDays(today, -today.getDay() + 1), // Lunes
      end: addDays(today, 7 - today.getDay()), // Domingo
      label: 'Esta semana'
    },
    lastWeek: {
      start: addDays(today, -today.getDay() - 6), // Lunes anterior
      end: addDays(today, -today.getDay()), // Domingo anterior
      label: 'Semana pasada'
    },
    thisMonth: {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
      label: 'Este mes'
    },
    lastMonth: {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
      label: 'Mes pasado'
    },
    thisYear: {
      start: new Date(today.getFullYear(), 0, 1),
      end: new Date(today.getFullYear(), 11, 31),
      label: 'Este año'
    },
    lastYear: {
      start: new Date(today.getFullYear() - 1, 0, 1),
      end: new Date(today.getFullYear() - 1, 11, 31),
      label: 'Año pasado'
    }
  };
}

/**
 * Formatea un rango de fechas para mostrar
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (start.getTime() === end.getTime()) {
    return formatDateUY(start);
  }
  
  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${formatDateUY(end)}`;
    }
    return `${formatDateUY(start)} - ${formatDateUY(end)}`;
  }
  
  return `${formatDateUY(start)} - ${formatDateUY(end)}`;
}

export default {
  // Formateo
  formatDateUY,
  formatDateLongUY,
  formatDateTimeUY,
  formatDateForVelneo,
  formatDateForAPI,
  formatRelativeDate,
  formatDateRange,
  
  // Parsing
  parseDateFromUY,
  parseFlexibleDate,
  
  // Operaciones
  addDays,
  addMonths,
  addYears,
  diffInDays,
  diffInMonths,
  diffInYears,
  calculateAge,
  
  // Validaciones
  isValidDate,
  isInPast,
  isInFuture,
  isInRange,
  isToday,
  isWeekend,
  isHoliday,
  
  // Negocio
  calculateDefaultExpiryDate,
  calculateRenewalDate,
  validatePolicyDates,
  getNextBusinessDay,
  getNextWorkDay,
  getBusinessDaysBetween,
  
  // Feriados
  getHolidays,
  
  // UI
  getCommonDateRanges,
  
  // Configuración
  URUGUAY_CONFIG,
  DATE_FORMATS
};