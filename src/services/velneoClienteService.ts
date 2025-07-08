// src/services/velneoClientesService.ts
import { apiService } from './api';
import { Cliente } from '../types/cliente';
import { Poliza } from '../types/poliza';

// Interfaces para mapear respuesta de Velneo
interface VelneoCliente {
  clinro: number;
  clinom: string;
  clicod: string;
  clitel?: string;
  cliemail?: string;
  clidir?: string;
  cliact?: boolean;
}

interface VelneoContrato {
  connro: number;
  clinro: number; 
  connrotext: string;
  compan: string;
  secnom: string;
  convig: string;
  confin: string;
  conpri?: number;
  conmon?: string;
  consta?: string;
}

export class VelneoClientesService {
  private baseUrl = '/velneo-clientes';

  public async getClientes(): Promise<Cliente[]> {
    try {
      const response = await apiService.get<VelneoCliente[]>(`${this.baseUrl}/clientes`);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error obteniendo clientes');
      }

      return response.data.map(this.mapVelneoClienteToCliente);
    } catch (error: any) {
      console.error('Error fetching clientes:', error);
      throw new Error(error.message || 'Error obteniendo clientes desde Velneo');
    }
  }

  public async getClienteById(id: number): Promise<Cliente | null> {
    try {
      const response = await apiService.get<VelneoCliente>(`${this.baseUrl}/clientes/${id}`);
      
      if (!response.success) {
        if (response.statusCode === 404) {
          return null;
        }
        throw new Error(response.error || 'Error obteniendo cliente');
      }

      return response.data ? this.mapVelneoClienteToCliente(response.data) : null;
    } catch (error: any) {
      console.error('Error fetching cliente:', error);
      throw new Error(error.message || 'Error obteniendo cliente desde Velneo');
    }
  }

  public async getPolizasByCliente(clienteId: number): Promise<Poliza[]> {
    try {
      const response = await apiService.get<VelneoContrato[]>(`${this.baseUrl}/contratos?filter[clientes]=${clienteId}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error obteniendo pólizas');
      }

      return response.data.map(contrato => this.mapVelneoContratoToPoliza(contrato, clienteId));
    } catch (error: any) {
      console.error('Error fetching polizas:', error);
      throw new Error(error.message || 'Error obteniendo pólizas desde Velneo');
    }
  }

  public async searchClientes(query: string): Promise<Cliente[]> {
    try {
      const response = await apiService.get<VelneoCliente[]>(`${this.baseUrl}/clientes/search?q=${encodeURIComponent(query)}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error buscando clientes');
      }

      return response.data.map(this.mapVelneoClienteToCliente);
    } catch (error: any) {
      console.error('Error searching clientes:', error);
      throw new Error(error.message || 'Error buscando clientes en Velneo');
    }
  }

  private mapVelneoClienteToCliente(velneoCliente: VelneoCliente): Cliente {
    return {
      id: velneoCliente.clinro,
      nombre: velneoCliente.clinom || '',
      documento: velneoCliente.clicod || '',
      telefono: velneoCliente.clitel || '',
      email: velneoCliente.cliemail || '',
      direccion: velneoCliente.clidir || '',
      activo: velneoCliente.cliact !== false, 
    };
  }

  private mapVelneoContratoToPoliza(contrato: VelneoContrato, clienteId: number): Poliza {
    const estado = this.mapContratoEstado(contrato.consta);
    
    return {
      id: contrato.connro,
      clienteId: clienteId,
      numero: contrato.connrotext || contrato.connro.toString(),
      compania: contrato.compan || '',
      ramo: contrato.secnom || '',
      estado: estado,
      fechaDesde: this.formatVelneoDate(contrato.convig),
      fechaHasta: this.formatVelneoDate(contrato.confin),
      prima: contrato.conpri || 0,
      moneda: contrato.conmon || 'UYU',
    };
  }

  private mapContratoEstado(consta?: string): 'Vigente' | 'Vencida' | 'Cancelada' | 'Pendiente' {
    if (!consta) return 'Pendiente';
    
    switch (consta.toLowerCase()) {
      case '1':
      case 'vigente':
      case 'activo':
        return 'Vigente';
      case '2':
      case 'vencida':
      case 'vencido':
        return 'Vencida';
      case '3':
      case 'cancelada':
      case 'cancelado':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  }

  private formatVelneoDate(dateString?: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString);
      return dateString || '';
    }
  }
}

export const velneoClienteService = new VelneoClientesService();