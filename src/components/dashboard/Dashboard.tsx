// src/components/dashboard/Dashboard.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'scanner' | 'verification' | 'reports'>('dashboard');

  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y título */}
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">RegularizadorPolizas</h1>
            </div>

            {/* Navegación */}
            <nav className="hidden md:flex space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('scanner')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'scanner'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Procesar Pólizas
              </button>
              <button
                onClick={() => setCurrentView('verification')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'verification'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Verificación
              </button>
              <button
                onClick={() => setCurrentView('reports')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'reports'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reportes
              </button>
            </nav>

            {/* Usuario y logout */}
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.nombre}</p>
                <p className="text-gray-500">{user?.roles.map(role => role.name).join(', ')}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                title="Cerrar sesión"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-6 px-6">
        {currentView === 'dashboard' && <DashboardOverview />}
        {currentView === 'scanner' && <PolizaScannerView />}
        {currentView === 'verification' && <VerificationView />}
        {currentView === 'reports' && <ReportsView />}
      </main>
    </div>
  );
}

// Componente Overview del Dashboard
function DashboardOverview() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="poliza-card">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Bienvenido, {user?.nombre}!
        </h2>
        <p className="text-gray-600">
          Sistema de procesamiento automático de pólizas de seguro para reducir el tiempo de renovaciones de 45-60 minutos a 30 segundos.
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="poliza-card">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pólizas Procesadas</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="poliza-card">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tiempo Ahorrado</p>
              <p className="text-2xl font-bold text-gray-900">0h</p>
            </div>
          </div>
        </div>

        <div className="poliza-card">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="poliza-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Subir Póliza</p>
              <p className="text-sm text-gray-600">Procesar nuevo documento PDF</p>
            </div>
          </button>

          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Ver Reportes</p>
              <p className="text-sm text-gray-600">Estadísticas y métricas</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Placeholder para otras vistas
function PolizaScannerView() {
  return (
    <div className="poliza-card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Procesador de Pólizas</h2>
      <p className="text-gray-600">Aquí irá el componente de drag & drop y procesamiento de PDFs.</p>
    </div>
  );
}

function VerificationView() {
  return (
    <div className="poliza-card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Panel de Verificación</h2>
      <p className="text-gray-600">Aquí irá el sistema de verificación post-Velneo.</p>
    </div>
  );
}

function ReportsView() {
  return (
    <div className="poliza-card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Reportes y Estadísticas</h2>
      <p className="text-gray-600">Aquí irán los reportes de rendimiento y métricas del sistema.</p>
    </div>
  );
}