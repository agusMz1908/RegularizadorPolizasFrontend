import { Poliza } from "./poliza";

export interface Cliente {
  id: number;
  clinro: number;
  corrcod: number;
  subcorr: number;
  clinom: string;              // ← Nombre del cliente
  telefono: string;
  clitelcel: string;           // ← Teléfono celular
  clifchnac: string | null;    // ← Fecha de nacimiento
  clifching: string | null;
  clifchegr: string | null;
  clicargo: string;
  clicon: string;
  cliruc: string;              // ← RUC
  clirsoc: string;
  cliced: string;              // ← Cédula/Documento
  clilib: string;
  clicatlib: string;
  clitpo: string;
  clidir: string;              // ← Dirección
  cliemail: string;            // ← Email
  clivtoced: string | null;
  clivtolib: string | null;
  cliposcod: number;
  clitelcorr: string;
  clidptnom: string;           // ← Departamento
  clisex: string;
  clitelant: string;
  cliobse: string;
  clifax: string;
  cliclasif: string;
  clinumrel: string;
  clicasapt: string;
  clidircob: string;           // ← Dirección de cobranza
  clibse: number;
  clifoto: string;
  pruebamillares: number;
  ingresado: string;
  clialias: string;
  clipor: string;
  clisancor: string;
  clirsa: string;
  codposcob: number;
  clidptcob: string;
  activo: boolean;             // ← Estado activo/inactivo
  cli_s_cris: string;
  clifchnac1: string;
  clilocnom: string;
  cliloccob: string;
  categorias_de_cliente: number;
  sc_departamentos: string;
  sc_localidades: string;
  fch_ingreso: string | null;
  grupos_economicos: number;
  etiquetas: boolean;
  doc_digi: boolean;
  password: string;
  habilita_app: boolean;
  referido: string;
  altura: number;
  peso: number;
  cliberkley: string;
  clifar: string;
  clisurco: string;
  clihdi: string;
  climapfre: string;
  climetlife: string;
  clisancris: string;
  clisbi: string;
  edo_civil: string;
  not_bien_mail: boolean;
  not_bien_wap: boolean;
  ing_poliza_mail: boolean;
  ing_poliza_wap: boolean;
  ing_siniestro_mail: boolean;
  ing_siniestro_wap: boolean;
  noti_obs_sini_mail: boolean;
  noti_obs_sini_wap: boolean;
  last_update: string | null;
  app_id: number;
  polizas: Poliza[];
}