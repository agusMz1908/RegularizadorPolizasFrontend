import { Poliza } from "./poliza";

export interface Cliente {
  id: number;
  clinro?: number;
  corrcod?: number;
  subcorr?: number;
  
  clinom?: string;       
  cliced?: string;     
  cliruc?: string;      
  cliemail?: string;     
  telefono?: string;      
  clitelcel?: string;    
  
  clifchnac?: string;  
  clifching?: string;     
  clifchegr?: string;     
  
  clicargo?: string;      // Cargo
  clicon?: string;        // Contacto
  clirsoc?: string;       // Razón social
  clilib?: string;        // Libreta
  clicatlib?: string;     // Categoría libreta
  clitpo?: string;        // Tipo
  clidir?: string;        // Dirección (era "direccion")
  clivtoced?: string;     // Vencimiento cédula
  clivtolib?: string;     // Vencimiento libreta
  cliposcod?: string;     // Código postal
  clitelcorr?: string;    // Teléfono corredor
  clidptnom?: string;     // Departamento
  clisex?: string;        // Sexo
  clitelant?: string;     // Teléfono anterior
  cliobse?: string;       // Observaciones
  clifax?: string;        // Fax
  cliclasif?: string;     // Clasificación
  clinumrel?: string;     // Número relación
  
  fch_ingreso?: string;   // Fecha ingreso formateada
  activo?: boolean;       // Estado activo
  
  polizas?: Poliza[];
  totalPolizas?: number;
  
  get nombre(): string;
  get documento(): string;
  get email(): string;
  get direccion(): string;
  get fechaCreacion(): string;
  get fechaActualizacion(): string;
  get estado(): 'activo' | 'inactivo';
  get tipoDocumento(): 'CI' | 'RUT' | 'Pasaporte';
}

export class ClienteMapper {
  
  static fromBackend(clienteDto: any): Cliente {
    const cliente = {
      ...clienteDto,
      
      get nombre(): string {
        return this.clinom || '';
      },
      
      get documento(): string {
        return this.cliced || this.cliruc || '';
      },
      
      get email(): string {
        return this.cliemail || '';
      },
      
      get direccion(): string {
        return this.clidir || '';
      },
      
      get fechaCreacion(): string {
        return this.clifching || this.fch_ingreso || '';
      },
      
      get fechaActualizacion(): string {
        return this.clifchegr || '';
      },
      
      get estado(): 'activo' | 'inactivo' {
        return this.activo ? 'activo' : 'inactivo';
      },
      
      get tipoDocumento(): 'CI' | 'RUT' | 'Pasaporte' {
        if (this.cliruc) return 'RUT';
        if (this.cliced) return 'CI';
        return 'Pasaporte';
      }
    } as Cliente;
    
    return cliente;
  }

  static toBackend(cliente: Cliente): any {
    return {
      id: cliente.id,
      clinom: cliente.clinom || cliente.nombre,
      cliced: cliente.cliced || cliente.documento,
      cliruc: cliente.cliruc,
      cliemail: cliente.cliemail || cliente.email,
      telefono: cliente.telefono,
      clitelcel: cliente.clitelcel,
      clidir: cliente.clidir || cliente.direccion,
      clifchnac: cliente.clifchnac,
      activo: cliente.activo ?? true,
    };
  }
  
  static fromBackendArray(clienteDtos: any[]): Cliente[] {
    return clienteDtos.map(dto => this.fromBackend(dto));
  }
}


export interface ClienteFormData {
  clinom: string;
  cliced?: string;
  cliruc?: string;
  cliemail?: string;
  telefono?: string;
  clitelcel?: string;
  clidir?: string;
  clifchnac?: string;
  activo?: boolean;
}

export interface ClienteFilters {
  search?: string;
  activo?: boolean;
  tipoDocumento?: 'CI' | 'RUT' | 'Pasaporte';
  departamento?: string;
}