export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://localhost:7191/api',
  TIMEOUT: 30000,
  RETRIES: 2,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['application/pdf']
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'regularizador_token',
  USER_DATA: 'regularizador_user'
} as const;

export const ENDPOINTS = {
  // Endpoints principales
  POLIZAS: '/polizas',              
  CLIENTES: '/clientes',
  COMPANIES: '/companies',
  SECCIONES: '/secciones',
  
  // Azure Document Intelligence
  AZURE_PROCESS: '/azuredocument/process',
  AZURE_MODEL_INFO: '/azuredocument/model-info',
  
  // Autenticación
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  
  // Salud del sistema
  HEALTH: '/health'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;
