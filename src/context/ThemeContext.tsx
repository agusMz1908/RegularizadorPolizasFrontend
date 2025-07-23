// src/context/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Estado del tema con persistencia
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('regularizador-theme') as Theme;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
    }
    return 'system';
  });

  // Estado del tema efectivo (resuelto)
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Detectar preferencia del sistema
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Resolver el tema efectivo
  const resolveEffectiveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Aplicar el tema al DOM
  const applyTheme = (resolvedTheme: 'light' | 'dark') => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      
      // Remover clases anteriores
      root.classList.remove('light', 'dark');
      
      // Agregar nueva clase
      root.classList.add(resolvedTheme);
      
      // Para compatibilidad con Tailwind CSS
      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Actualizar meta theme-color para mobile
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#1f2937' : '#ffffff');
      }

      console.log('🎨 Theme applied:', resolvedTheme, 'HTML classes:', root.classList.toString());
    }
  };

  // Función para cambiar el tema
  const setTheme = (newTheme: Theme) => {
    console.log('🎨 Setting theme:', newTheme);
    setThemeState(newTheme);
    
    // Persistir en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('regularizador-theme', newTheme);
    }
    
    // Resolver y aplicar tema efectivo
    const resolved = resolveEffectiveTheme(newTheme);
    setEffectiveTheme(resolved);
    applyTheme(resolved);

    // Dispatch evento para otros componentes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('theme-changed', { 
        detail: { theme: newTheme, effectiveTheme: resolved } 
      }));
    }
  };

  // Toggle entre light y dark (ignora system)
  const toggleTheme = () => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        const newEffectiveTheme = getSystemTheme();
        setEffectiveTheme(newEffectiveTheme);
        applyTheme(newEffectiveTheme);
      }
    };

    // Listener moderno
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, [theme]);

  // Aplicar tema inicial
  useEffect(() => {
    const resolved = resolveEffectiveTheme(theme);
    setEffectiveTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Debug logging en desarrollo
  useEffect(() => {
    console.log('🎨 Theme state:', { theme, effectiveTheme });
  }, [theme, effectiveTheme]);

  const value: ThemeContextType = {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para usar el contexto de tema
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook simplificado para componentes que solo necesitan el tema efectivo
export const useEffectiveTheme = (): 'light' | 'dark' => {
  const { effectiveTheme } = useTheme();
  return effectiveTheme;
};

// Hook para detectar si estamos en modo oscuro
export const useDarkMode = (): boolean => {
  const { effectiveTheme } = useTheme();
  return effectiveTheme === 'dark';
};

export default ThemeContext;