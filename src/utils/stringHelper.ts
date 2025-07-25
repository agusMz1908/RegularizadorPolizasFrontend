
export const URUGUAY_STRING_CONFIG = {
  locale: 'es-UY',
  currency: 'UYU',
  phonePrefix: '+598',
  postalCodeLength: 5
};

export function cleanText(text: string): string {
  if (!text) return '';
  
  return text
    .trim()
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .replace(/\n+/g, '\n') // Múltiples saltos de línea a uno solo
    .replace(/\t+/g, ' '); // Tabs a espacios
}

/**
 * Normaliza texto para búsquedas (sin acentos, minúsculas)
 */
export function normalizeForSearch(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
    .replace(/[^\w\s]/g, ' ') // Caracteres especiales a espacios
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Remueve caracteres especiales manteniendo solo alfanuméricos
 */
export function sanitizeAlphanumeric(text: string): string {
  if (!text) return '';
  
  return text.replace(/[^a-zA-Z0-9\s]/g, '').trim();
}

/**
 * Remueve todo excepto números
 */
export function extractNumbers(text: string): string {
  if (!text) return '';
  
  return text.replace(/\D/g, '');
}

/**
 * Remueve todo excepto letras
 */
export function extractLetters(text: string): string {
  if (!text) return '';
  
  return text.replace(/[^a-zA-ZáéíóúñüÁÉÍÓÚÑÜ]/g, '');
}

// ============================================================================
// ✏️ FUNCIONES DE FORMATEO
// ============================================================================

/**
 * Capitaliza la primera letra de cada palabra
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Capitaliza solo la primera letra del texto
 */
export function capitalizeFirst(text: string): string {
  if (!text) return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formatea nombres propios (maneja casos especiales)
 */
export function formatProperName(name: string): string {
  if (!name) return '';
  
  // Casos especiales en nombres uruguayos
  const specialCases: Record<string, string> = {
    'de': 'de',
    'del': 'del',
    'la': 'la',
    'las': 'las',
    'los': 'los',
    'da': 'da',
    'do': 'do',
    'dos': 'dos',
    'das': 'das',
    'van': 'van',
    'von': 'von',
    'mac': 'Mac',
    'mc': 'Mc',
    "o'": "O'"
  };
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      const lower = word.toLowerCase();
      if (specialCases[lower]) {
        return specialCases[lower];
      }
      
      // Casos especiales con apostrofes
      if (word.includes("'")) {
        return word.split("'").map(part => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join("'");
      }
      
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Convierte texto a formato slug (URL friendly)
 */
export function toSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .replace(/^-|-$/g, ''); // Remover guiones al inicio/final
}

/**
 * Convierte a camelCase
 */
export function toCamelCase(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
}

/**
 * Convierte a snake_case
 */
export function toSnakeCase(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('_');
}

// ============================================================================
// 🇺🇾 FORMATEO ESPECÍFICO PARA URUGUAY
// ============================================================================

/**
 * Formatea cédula de identidad uruguaya
 */
export function formatCI(ci: string): string {
  if (!ci) return '';
  
  const cleaned = extractNumbers(ci).padStart(8, '0');
  if (cleaned.length !== 8) return ci;
  
  return `${cleaned.slice(0, 1)}.${cleaned.slice(1, 4)}.${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
}

/**
 * Formatea RUT uruguayo
 */
export function formatRUT(rut: string): string {
  if (!rut) return '';
  
  const cleaned = extractNumbers(rut);
  if (cleaned.length !== 12) return rut;
  
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}.${cleaned.slice(8, 11)}.${cleaned.slice(11)}`;
}

/**
 * Formatea número de teléfono uruguayo
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  
  const cleaned = extractNumbers(phone);
  
  if (cleaned.length === 8) {
    // Teléfono fijo: 2456 7890
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  } else if (cleaned.length === 9 && cleaned.startsWith('09')) {
    // Móvil: 098 765 432
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone; // Devolver original si no coincide con formatos esperados
}

/**
 * Formatea dirección uruguaya
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  
  // Capitalizar palabras y limpiar
  const formatted = capitalizeWords(cleanText(address));
  
  // Casos especiales para direcciones
  return formatted
    .replace(/\bav\b/gi, 'Av.')
    .replace(/\bavda\b/gi, 'Av.')
    .replace(/\bavenida\b/gi, 'Av.')
    .replace(/\bcalle\b/gi, 'Calle')
    .replace(/\bbvar\b/gi, 'Bvar.')
    .replace(/\bbulevar\b/gi, 'Bvar.')
    .replace(/\brambla\b/gi, 'Rambla')
    .replace(/\bpasaje\b/gi, 'Pasaje')
    .replace(/\bapto\b/gi, 'Apto.')
    .replace(/\bapartamento\b/gi, 'Apto.');
}

/**
 * Formatea matrícula de vehículo
 */
export function formatLicensePlate(plate: string): string {
  if (!plate) return '';
  
  const cleaned = plate.replace(/[^A-Z0-9]/g, '').toUpperCase();
  
  // Formato uruguayo típico: ABC1234 o AB1234
  if (/^[A-Z]{2,3}\d{4}$/.test(cleaned)) {
    return cleaned;
  }
  
  // Formato antiguo: 1234AB
  if (/^\d{4}[A-Z]{2}$/.test(cleaned)) {
    return cleaned;
  }
  
  return cleaned;
}

/**
 * Formatea código postal uruguayo
 */
export function formatPostalCode(code: string): string {
  if (!code) return '';
  
  const cleaned = extractNumbers(code);
  return cleaned.padStart(5, '0').slice(0, 5);
}

// ============================================================================
// 💰 FORMATEO DE MONEDA Y NÚMEROS
// ============================================================================

/**
 * Formatea números con separadores de miles uruguayos
 */
export function formatNumber(num: number | string, decimals: number = 0): string {
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '0';
  
  return number.toLocaleString('es-UY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formatea moneda uruguaya
 */
export function formatCurrency(amount: number | string, currency: string = 'UYU'): string {
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(number)) return `${currency} 0`;
  
  const currencySymbols: Record<string, string> = {
    'UYU': '$',
    'USD': 'US$',
    'EUR': '€',
    'UI': 'UI'
  };
  
  const symbol = currencySymbols[currency] || currency;
  const formatted = formatNumber(number, 2);
  
  return `${symbol} ${formatted}`;
}

/**
 * Formatea porcentajes
 */
export function formatPercentage(value: number | string, decimals: number = 1): string {
  const number = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(number)) return '0%';
  
  return `${formatNumber(number, decimals)}%`;
}

// ============================================================================
// 🔍 FUNCIONES DE BÚSQUEDA Y COMPARACIÓN
// ============================================================================

/**
 * Verifica si un texto contiene otro (sin case sensitive)
 */
export function containsText(haystack: string, needle: string): boolean {
  if (!haystack || !needle) return false;
  
  return normalizeForSearch(haystack).includes(normalizeForSearch(needle));
}

/**
 * Calcula similitud entre dos strings (algoritmo de Levenshtein simplificado)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const s1 = normalizeForSearch(str1);
  const s2 = normalizeForSearch(str2);
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Encuentra coincidencias parciales en un array de strings
 */
export function findMatches(
  searchTerm: string, 
  items: string[], 
  threshold: number = 0.3
): Array<{ item: string; similarity: number }> {
  if (!searchTerm) return [];
  
  return items
    .map(item => ({
      item,
      similarity: calculateSimilarity(searchTerm, item)
    }))
    .filter(result => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
}

/**
 * Resalta texto de búsqueda en un string
 */
export function highlightText(text: string, searchTerm: string, className: string = 'highlight'): string {
  if (!text || !searchTerm) return text;
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, `<span class="${className}">$1</span>`);
}

// ============================================================================
// 📏 VALIDACIONES DE FORMATO
// ============================================================================

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de URL
 */
export function isValidURL(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida que un string sea solo números
 */
export function isNumeric(str: string): boolean {
  if (!str) return false;
  return /^\d+$/.test(str);
}

/**
 * Valida que un string sea alfanumérico
 */
export function isAlphanumeric(str: string): boolean {
  if (!str) return false;
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Valida longitud de string
 */
export function isValidLength(str: string, min: number = 0, max: number = Infinity): boolean {
  if (!str) return min === 0;
  return str.length >= min && str.length <= max;
}

// ============================================================================
// 📱 UTILIDADES DE TEXTO PARA UI
// ============================================================================

/**
 * Trunca texto y agrega puntos suspensivos
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Trunca por palabras (no corta palabras a la mitad)
 */
export function truncateWords(text: string, maxWords: number, suffix: string = '...'): string {
  if (!text) return '';
  
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  
  return words.slice(0, maxWords).join(' ') + suffix;
}

/**
 * Genera iniciales de un nombre
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Pluraliza una palabra según cantidad
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  
  const pluralForm = plural || `${singular}s`;
  return `${count} ${pluralForm}`;
}

/**
 * Convierte bytes a formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Genera un ID único basado en texto
 */
export function generateId(text: string): string {
  const base = toSlug(text);
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  
  return `${base}-${timestamp}-${random}`;
}

// ============================================================================
// 🔧 UTILIDADES AUXILIARES
// ============================================================================

/**
 * Escapa caracteres especiales para regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Calcula distancia de Levenshtein entre dos strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Máscaras de entrada comunes
 */
export const INPUT_MASKS = {
  CI: '_.___.___.___-_',
  RUT: '__.___.___.___._',
  PHONE_MOBILE: '0__ ___ ___',
  PHONE_FIXED: '____ ____',
  POSTAL_CODE: '_____',
  LICENSE_PLATE: 'AAA____'
};

/**
 * Patrones de validación comunes
 */
export const VALIDATION_PATTERNS = {
  CI: /^\d{1}\.\d{3}\.\d{3}-\d{1}$/,
  RUT: /^\d{2}\.\d{3}\.\d{3}\.\d{3}\.\d{1}$/,
  PHONE_MOBILE: /^09\d \d{3} \d{3}$/,
  PHONE_FIXED: /^\d{4} \d{4}$/,
  LICENSE_PLATE_NEW: /^[A-Z]{2,3}\d{4}$/,
  LICENSE_PLATE_OLD: /^\d{4}[A-Z]{2}$/,
  POSTAL_CODE: /^\d{5}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

export default {
  // Limpieza
  cleanText,
  normalizeForSearch,
  sanitizeAlphanumeric,
  extractNumbers,
  extractLetters,
  
  // Formateo general
  capitalizeWords,
  capitalizeFirst,
  formatProperName,
  toSlug,
  toCamelCase,
  toSnakeCase,
  
  // Formateo específico Uruguay
  formatCI,
  formatRUT,
  formatPhone,
  formatAddress,
  formatLicensePlate,
  formatPostalCode,
  
  // Números y moneda
  formatNumber,
  formatCurrency,
  formatPercentage,
  
  // Búsqueda
  containsText,
  calculateSimilarity,
  findMatches,
  highlightText,
  
  // Validaciones
  isValidEmail,
  isValidURL,
  isNumeric,
  isAlphanumeric,
  isValidLength,
  
  // UI
  truncate,
  truncateWords,
  getInitials,
  pluralize,
  formatFileSize,
  generateId,
  
  // Constantes
  URUGUAY_STRING_CONFIG,
  INPUT_MASKS,
  VALIDATION_PATTERNS
};