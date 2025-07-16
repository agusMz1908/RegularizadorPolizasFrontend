// src/utils/testAzureIntegration.ts
import { azureDocumentService } from '../services/azureDocumentService';

export interface TestResult {
  test: string;
  success: boolean;
  message: string;
  duration?: number;
}

export class AzureIntegrationTester {
  
  public async runAllTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    console.log('🧪 Iniciando tests de integración Azure Document Intelligence...');
    
    // Test 1: Verificar configuración
    results.push(await this.testConfiguration());
    
    // Test 2: Probar conexión con backend
    results.push(await this.testBackendConnection());
    
    // Test 3: Verificar endpoint Azure via backend
    results.push(await this.testAzureConnection());
    
    // Test 4: Obtener información del modelo
    results.push(await this.testModelInfo());
    
    // Test 5: Debug completo (opcional)
    results.push(await this.testDebugInfo());
    
    this.printTestSummary(results);
    
    return results;
  }
  
  private async testConfiguration(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const config = azureDocumentService.validateConfiguration();
      
      if (config.isValid) {
        return {
          test: 'Configuración Frontend',
          success: true,
          message: 'Todas las variables de entorno están configuradas correctamente',
          duration: Date.now() - startTime
        };
      } else {
        return {
          test: 'Configuración Frontend',
          success: false,
          message: `Errores de configuración: ${config.errors.join(', ')}`,
          duration: Date.now() - startTime
        };
      }
    } catch (error: any) {
      return {
        test: 'Configuración Frontend',
        success: false,
        message: `Error verificando configuración: ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  }
  
  private async testBackendConnection(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Hacer una llamada simple al backend para verificar conectividad
      const response = await fetch(`${import.meta.env.VITE_API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          test: 'Conexión Backend',
          success: true,
          message: `Backend respondiendo correctamente. Status: ${data.Status}`,
          duration: Date.now() - startTime
        };
      } else {
        return {
          test: 'Conexión Backend',
          success: false,
          message: `Backend no disponible. Status: ${response.status}`,
          duration: Date.now() - startTime
        };
      }
    } catch (error: any) {
      return {
        test: 'Conexión Backend',
        success: false,
        message: `Error conectando al backend: ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  }
  
  private async testAzureConnection(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const isConnected = await azureDocumentService.testConnection();
      
      if (isConnected) {
        return {
          test: 'Conexión Azure (via Backend)',
          success: true,
          message: 'Azure Document Intelligence responde correctamente',
          duration: Date.now() - startTime
        };
      } else {
        return {
          test: 'Conexión Azure (via Backend)',
          success: false,
          message: 'Azure Document Intelligence no responde o configuración incorrecta',
          duration: Date.now() - startTime
        };
      }
    } catch (error: any) {
      return {
        test: 'Conexión Azure (via Backend)',
        success: false,
        message: `Error probando Azure: ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  }
  
  private async testModelInfo(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const modelInfo = await azureDocumentService.getModelInfo();
      
      if (modelInfo && modelInfo.ModelId) {
        return {
          test: 'Información del Modelo',
          success: true,
          message: `Modelo encontrado: ${modelInfo.ModelId}. Status: ${modelInfo.Status}`,
          duration: Date.now() - startTime
        };
      } else {
        return {
          test: 'Información del Modelo',
          success: false,
          message: 'No se pudo obtener información del modelo Azure',
          duration: Date.now() - startTime
        };
      }
    } catch (error: any) {
      return {
        test: 'Información del Modelo',
        success: false,
        message: `Error obteniendo modelo: ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  }
  
  private async testDebugInfo(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const debugInfo = await azureDocumentService.debugAllModels();
      
      if (debugInfo && debugInfo.includes('SUCCESS')) {
        return {
          test: 'Debug Completo',
          success: true,
          message: 'Debug ejecutado correctamente. Revisa la consola para detalles.',
          duration: Date.now() - startTime
        };
      } else {
        return {
          test: 'Debug Completo',
          success: false,
          message: 'Debug no completado exitosamente',
          duration: Date.now() - startTime
        };
      }
    } catch (error: any) {
      return {
        test: 'Debug Completo',
        success: false,
        message: `Error en debug: ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  }
  
  private printTestSummary(results: TestResult[]): void {
    console.log('\n📊 RESUMEN DE TESTS DE INTEGRACIÓN');
    console.log('=====================================');
    
    results.forEach((result, index) => {
      const icon = result.success ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      
      console.log(`${icon} ${index + 1}. ${result.test}${duration}`);
      console.log(`   ${result.message}`);
      console.log('');
    });
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`🎯 Resultado final: ${successCount}/${totalCount} tests exitosos`);
    
    if (successCount === totalCount) {
      console.log('🎉 ¡Todos los tests pasaron! La integración está funcionando correctamente.');
    } else {
      console.log('⚠️  Algunos tests fallaron. Revisa la configuración.');
    }
  }
  
  // Método para crear un archivo de prueba simulado
  public createTestFile(): File {
    const content = new Blob(['Test PDF content for Azure Document Intelligence'], { 
      type: 'application/pdf' 
    });
    
    return new File([content], 'test-poliza.pdf', { 
      type: 'application/pdf',
      lastModified: Date.now()
    });
  }
  
  // Test adicional: Procesar un documento de prueba
  public async testDocumentProcessing(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log('🧪 Iniciando test de procesamiento de documento...');
      
      const testFile = this.createTestFile();
      
      const result = await azureDocumentService.processDocument(testFile);
      
      if (result && result.documentId) {
        return {
          test: 'Procesamiento de Documento',
          success: true,
          message: `Documento procesado exitosamente. ID: ${result.documentId}`,
          duration: Date.now() - startTime
        };
      } else {
        return {
          test: 'Procesamiento de Documento',
          success: false,
          message: 'No se recibió respuesta válida del procesamiento',
          duration: Date.now() - startTime
        };
      }
    } catch (error: any) {
      return {
        test: 'Procesamiento de Documento',
        success: false,
        message: `Error procesando documento: ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  }
}

// Instancia singleton
export const azureIntegrationTester = new AzureIntegrationTester();

// Función helper para ejecutar desde consola del navegador
(window as any).testAzureIntegration = async () => {
  const tester = new AzureIntegrationTester();
  const results = await tester.runAllTests();
  return results;
};

(window as any).testAzureDocumentProcessing = async () => {
  const tester = new AzureIntegrationTester();
  const result = await tester.testDocumentProcessing();
  console.log(result);
  return result;
};