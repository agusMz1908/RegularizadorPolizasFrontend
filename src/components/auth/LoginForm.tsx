// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { LoginRequest } from '@/types/auth';

const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [credentials, setCredentials] = useState<LoginRequest>({
    nombre: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validaciones básicas
    if (!credentials.nombre.trim()) {
      setLocalError('El usuario es requerido');
      return;
    }
    if (!credentials.password.trim()) {
      setLocalError('La contraseña es requerida');
      return;
    }

    try {
      await login(credentials);
      // El AuthContext maneja la redirección automática
    } catch (error) {
      // El error ya se maneja en el contexto
      setLocalError('Credenciales inválidas');
    }
  };

  const handleChange = (field: keyof LoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Limpiar errores al escribir
    if (localError) setLocalError('');
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            RegularizadorPolizas V2
          </h1>
          <p className="text-gray-600">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Iniciar Sesión</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={credentials.nombre}
                    onChange={handleChange('nombre')}
                    className="pl-10"
                    disabled={isLoading}
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={credentials.password}
                    onChange={handleChange('password')}
                    className="pl-10"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Error Display */}
              {displayError && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{displayError}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Test Credentials Info */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>🔑 <strong>Credenciales de prueba:</strong></p>
          <p>Usuario: <code className="bg-gray-100 px-1 rounded">superadmin</code></p>
          <p>Contraseña: <code className="bg-gray-100 px-1 rounded">string</code></p>
          <p className="mt-2">🏢 Tenant: <strong>KEYDEMO</strong></p>
        </div>

        {/* API Info */}
        <div className="text-center text-xs text-gray-400">
          <p>🔗 Conectando con: <code>{import.meta.env.VITE_API_BASE_URL}</code></p>
          <p>📡 Endpoint: <code>POST /api/auth/login</code></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;