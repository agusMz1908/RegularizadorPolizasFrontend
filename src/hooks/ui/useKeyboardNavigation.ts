// src/hooks/ui/useKeyboardNavigation.ts

import { useEffect, useCallback, useRef, useState } from 'react';

// ✅ Tipos de teclas soportadas
export type KeyboardKey = 
  | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'
  | 'Enter' | 'Space' | 'Escape' | 'Tab'
  | 'Home' | 'End' | 'PageUp' | 'PageDown'
  | 'Backspace' | 'Delete'
  | 'F1' | 'F2' | 'F3' | 'F4' | 'F5';

// ✅ Modificadores de teclado
export interface KeyModifiers {
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean; // Cmd en Mac, Windows key en Windows
}

// ✅ Configuración de shortcut
export interface KeyboardShortcut {
  key: KeyboardKey;
  modifiers?: KeyModifiers;
  action: () => void | Promise<void>;
  description: string;
  disabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

// ✅ Configuración del hook
export interface KeyboardNavigationConfig {
  enabled?: boolean;
  enableWizardNavigation?: boolean;
  enableFormNavigation?: boolean;
  enableGlobalShortcuts?: boolean;
  focusTrap?: boolean; // Mantener focus dentro del componente
  announceActions?: boolean; // Para screen readers
}

// ✅ Contexto de navegación
export interface NavigationContext {
  currentStep?: string;
  totalSteps?: number;
  stepIndex?: number;
  canGoNext?: boolean;
  canGoBack?: boolean;
  isInForm?: boolean;
  focusedElement?: string;
}

export interface UseKeyboardNavigationReturn {
  // Estado
  isEnabled: boolean;
  currentFocus: string | null;
  shortcuts: KeyboardShortcut[];
  
  // Configuración
  setEnabled: (enabled: boolean) => void;
  updateConfig: (config: Partial<KeyboardNavigationConfig>) => void;
  
  // Gestión de shortcuts
  addShortcut: (shortcut: KeyboardShortcut) => void;
  removeShortcut: (key: KeyboardKey, modifiers?: KeyModifiers) => void;
  clearShortcuts: () => void;
  
  // Navegación
  focusNext: () => void;
  focusPrevious: () => void;
  focusFirst: () => void;
  focusLast: () => void;
  focusElement: (selector: string) => void;
  
  // Callbacks para conectar con el wizard
  onNext?: () => void;
  onPrevious?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  
  // Utilidades
  getShortcutText: (shortcut: KeyboardShortcut) => string;
  announceAction: (message: string) => void;
}

// ✅ Shortcuts predefinidos para wizard
const DEFAULT_WIZARD_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  {
    key: 'ArrowRight',
    description: 'Ir al siguiente paso',
    preventDefault: true
  },
  {
    key: 'ArrowLeft', 
    description: 'Ir al paso anterior',
    preventDefault: true
  },
  {
    key: 'Enter',
    modifiers: { ctrl: true },
    description: 'Continuar al siguiente paso',
    preventDefault: true
  },
  {
    key: 'Escape',
    description: 'Cancelar wizard',
    preventDefault: true
  },
  {
    key: 'F1',
    description: 'Mostrar ayuda de navegación',
    preventDefault: true
  }
];

// ✅ Shortcuts para formularios
const DEFAULT_FORM_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  {
    key: 'Enter',
    modifiers: { ctrl: true },
    description: 'Guardar formulario',
    preventDefault: true
  },
  {
    key: 'Tab',
    description: 'Navegar entre campos',
    preventDefault: false
  },
  {
    key: 'Tab',
    modifiers: { shift: true },
    description: 'Navegar hacia atrás entre campos',
    preventDefault: false
  }
];

export const useKeyboardNavigation = (
  config: KeyboardNavigationConfig = {},
  context: NavigationContext = {}
): UseKeyboardNavigationReturn => {
  
  // ✅ Estado del hook
  const [isEnabled, setIsEnabled] = useState(config.enabled ?? true);
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [internalConfig, setInternalConfig] = useState<KeyboardNavigationConfig>({
    enabled: true,
    enableWizardNavigation: true,
    enableFormNavigation: true,
    enableGlobalShortcuts: true,
    focusTrap: false,
    announceActions: true,
    ...config
  });

  // ✅ Referencias
  const containerRef = useRef<HTMLElement | null>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  const currentFocusIndexRef = useRef<number>(0);

  // ✅ Callbacks del wizard
  const [callbacks, setCallbacks] = useState<{
    onNext?: () => void;
    onPrevious?: () => void;
    onCancel?: () => void;
    onSubmit?: () => void;
  }>({});

  // ✅ Actualizar configuración
  const updateConfig = useCallback((newConfig: Partial<KeyboardNavigationConfig>) => {
    setInternalConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // ✅ Obtener elementos enfocables
  const getFocusableElements = useCallback((): HTMLElement[] => {
    const container = containerRef.current || document;
    const selector = [
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  }, []);

  // ✅ Funciones de navegación
  const focusNext = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const currentIndex = currentFocusIndexRef.current;
    const nextIndex = (currentIndex + 1) % elements.length;
    
    elements[nextIndex]?.focus();
    currentFocusIndexRef.current = nextIndex;
    setCurrentFocus(elements[nextIndex]?.id || elements[nextIndex]?.className || 'unknown');
  }, [getFocusableElements]);

  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const currentIndex = currentFocusIndexRef.current;
    const prevIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
    
    elements[prevIndex]?.focus();
    currentFocusIndexRef.current = prevIndex;
    setCurrentFocus(elements[prevIndex]?.id || elements[prevIndex]?.className || 'unknown');
  }, [getFocusableElements]);

  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    elements[0]?.focus();
    currentFocusIndexRef.current = 0;
    setCurrentFocus(elements[0]?.id || elements[0]?.className || 'unknown');
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const lastIndex = elements.length - 1;
    elements[lastIndex]?.focus();
    currentFocusIndexRef.current = lastIndex;
    setCurrentFocus(elements[lastIndex]?.id || elements[lastIndex]?.className || 'unknown');
  }, [getFocusableElements]);

  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element && element.focus) {
      element.focus();
      const elements = getFocusableElements();
      const index = elements.indexOf(element);
      if (index !== -1) {
        currentFocusIndexRef.current = index;
      }
      setCurrentFocus(element.id || element.className || selector);
    }
  }, [getFocusableElements]);

  // ✅ Gestión de shortcuts
  const addShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      // Eliminar shortcut existente con la misma tecla y modificadores
      const filtered = prev.filter(s => !isShortcutMatch(s, shortcut));
      return [...filtered, shortcut];
    });
  }, []);

  const removeShortcut = useCallback((key: KeyboardKey, modifiers?: KeyModifiers) => {
    setShortcuts(prev => prev.filter(s => 
      !(s.key === key && isModifiersMatch(s.modifiers, modifiers))
    ));
  }, []);

  const clearShortcuts = useCallback(() => {
    setShortcuts([]);
  }, []);

  // ✅ Anunciar acciones (para screen readers)
  const announceAction = useCallback((message: string) => {
    if (!internalConfig.announceActions) return;

    // Crear elemento para anuncio
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only'; // Clase para screen readers only
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remover después de anunciar
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [internalConfig.announceActions]);

  // ✅ Obtener texto descriptivo del shortcut
  const getShortcutText = useCallback((shortcut: KeyboardShortcut): string => {
    const modifierTexts = [];
    
    if (shortcut.modifiers?.ctrl) modifierTexts.push('Ctrl');
    if (shortcut.modifiers?.alt) modifierTexts.push('Alt');
    if (shortcut.modifiers?.shift) modifierTexts.push('Shift');
    if (shortcut.modifiers?.meta) modifierTexts.push('Cmd');
    
    const keyText = shortcut.key.replace('Arrow', '');
    
    return [...modifierTexts, keyText].join(' + ');
  }, []);

  // ✅ Inicializar shortcuts por defecto
  useEffect(() => {
    const defaultShortcuts: KeyboardShortcut[] = [];

    // Shortcuts de wizard
    if (internalConfig.enableWizardNavigation) {
      DEFAULT_WIZARD_SHORTCUTS.forEach(shortcut => {
        let action: () => void = () => {};

        switch (shortcut.key) {
          case 'ArrowRight':
            action = () => {
              if (context.canGoNext && callbacks.onNext) {
                callbacks.onNext();
                announceAction('Navegando al siguiente paso');
              }
            };
            break;
          case 'ArrowLeft':
            action = () => {
              if (context.canGoBack && callbacks.onPrevious) {
                callbacks.onPrevious();
                announceAction('Navegando al paso anterior');
              }
            };
            break;
          case 'Enter':
            if (shortcut.modifiers?.ctrl) {
              action = () => {
                if (callbacks.onSubmit) {
                  callbacks.onSubmit();
                  announceAction('Enviando formulario');
                }
              };
            }
            break;
          case 'Escape':
            action = () => {
              if (callbacks.onCancel) {
                callbacks.onCancel();
                announceAction('Cancelando wizard');
              }
            };
            break;
          case 'F1':
            action = () => {
              const helpText = shortcuts
                .map(s => `${getShortcutText(s)}: ${s.description}`)
                .join(', ');
              announceAction(`Shortcuts disponibles: ${helpText}`);
            };
            break;
        }

        defaultShortcuts.push({ ...shortcut, action } as KeyboardShortcut);
      });
    }

    // Shortcuts de formulario
    if (internalConfig.enableFormNavigation && context.isInForm) {
      DEFAULT_FORM_SHORTCUTS.forEach(shortcut => {
        let action: () => void = () => {};

        switch (shortcut.key) {
          case 'Tab':
            action = shortcut.modifiers?.shift ? focusPrevious : focusNext;
            break;
          case 'Enter':
            if (shortcut.modifiers?.ctrl) {
              action = () => {
                if (callbacks.onSubmit) {
                  callbacks.onSubmit();
                  announceAction('Guardando formulario');
                }
              };
            }
            break;
        }

        defaultShortcuts.push({ ...shortcut, action } as KeyboardShortcut);
      });
    }

    setShortcuts(defaultShortcuts);
  }, [internalConfig, context, callbacks, announceAction, getShortcutText, focusNext, focusPrevious]);

  // ✅ Manejar eventos de teclado
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    // Buscar shortcut que coincida
    const matchingShortcut = shortcuts.find(shortcut => {
      if (shortcut.disabled) return false;
      
      return shortcut.key === event.key && isModifiersMatch(shortcut.modifiers, {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey
      });
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault) {
        event.preventDefault();
      }
      if (matchingShortcut.stopPropagation) {
        event.stopPropagation();
      }
      
      // Ejecutar acción
      matchingShortcut.action();
    }

    // Focus trap
    if (internalConfig.focusTrap && event.key === 'Tab') {
      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [isEnabled, shortcuts, internalConfig.focusTrap, getFocusableElements]);

  // ✅ Registrar event listeners
  useEffect(() => {
    if (!isEnabled) return;

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEnabled, handleKeyDown]);

  // ✅ Actualizar elementos enfocables cuando cambia el contenido
  useEffect(() => {
    focusableElementsRef.current = getFocusableElements();
  }, [getFocusableElements]);

  return {
    isEnabled,
    currentFocus,
    shortcuts,
    setEnabled: setIsEnabled,
    updateConfig,
    addShortcut,
    removeShortcut,
    clearShortcuts,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusElement,
    onNext: callbacks.onNext,
    onPrevious: callbacks.onPrevious,
    onCancel: callbacks.onCancel,
    onSubmit: callbacks.onSubmit,
    getShortcutText,
    announceAction
  };
};

// ✅ Hook específico para wizard
export const useWizardKeyboardNavigation = (
  currentStep: string,
  canGoNext: boolean,
  canGoBack: boolean,
  onNext: () => void,
  onPrevious: () => void,
  onCancel?: () => void
) => {
  const navigation = useKeyboardNavigation(
    {
      enableWizardNavigation: true,
      enableFormNavigation: false,
      announceActions: true
    },
    {
      currentStep,
      canGoNext,
      canGoBack
    }
  );

  // Configurar callbacks
  useEffect(() => {
    (navigation as any).setCallbacks?.({
      onNext,
      onPrevious,
      onCancel
    });
  }, [onNext, onPrevious, onCancel]);

  return navigation;
};

// ✅ Utilidades helper
function isShortcutMatch(s1: KeyboardShortcut, s2: KeyboardShortcut): boolean {
  return s1.key === s2.key && isModifiersMatch(s1.modifiers, s2.modifiers);
}

function isModifiersMatch(m1?: KeyModifiers, m2?: KeyModifiers): boolean {
  const mod1 = m1 || {};
  const mod2 = m2 || {};
  
  return (
    Boolean(mod1.ctrl) === Boolean(mod2.ctrl) &&
    Boolean(mod1.alt) === Boolean(mod2.alt) &&
    Boolean(mod1.shift) === Boolean(mod2.shift) &&
    Boolean(mod1.meta) === Boolean(mod2.meta)
  );
}

export default useKeyboardNavigation;