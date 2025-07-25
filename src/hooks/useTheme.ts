export { useTheme, useEffectiveTheme, useDarkMode } from '../context/ThemeContext';

import { useTheme as useThemeContext } from '../context/ThemeContext';

/**
 * Hook simplificado que solo retorna isDarkMode
 * Para componentes que solo necesitan saber si está en modo oscuro
 */
export const useIsDarkMode = (): boolean => {
  const { effectiveTheme } = useThemeContext();
  return effectiveTheme === 'dark';
};

/**
 * Hook que retorna solo las funciones de cambio de tema
 * Para componentes que solo necesitan cambiar el tema
 */
export const useThemeToggle = () => {
  const { setTheme, toggleTheme } = useThemeContext();
  return { setTheme, toggleTheme };
};

/**
 * Hook completo con todos los valores y funciones
 * Para componentes que necesitan acceso completo al estado del tema
 */
export const useFullTheme = () => {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useThemeContext();
  
  return {
    // Estados
    theme,                    // 'light' | 'dark' | 'system'
    effectiveTheme,          // 'light' | 'dark' (resuelto)
    isDarkMode: effectiveTheme === 'dark',
    isLightMode: effectiveTheme === 'light',
    isSystemMode: theme === 'system',
    
    // Acciones
    setTheme,                // (theme: 'light' | 'dark' | 'system') => void
    toggleTheme,             // () => void
    setLight: () => setTheme('light'),
    setDark: () => setTheme('dark'),
    setSystem: () => setTheme('system'),
    
    // Helpers
    getThemeClass: () => effectiveTheme,
    getBodyClass: () => effectiveTheme === 'dark' ? 'dark-mode' : 'light-mode'
  };
};

// ✅ Export por defecto del hook principal
export default useThemeContext;