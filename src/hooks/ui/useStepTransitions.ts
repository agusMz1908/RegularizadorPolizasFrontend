// src/hooks/ui/useStepTransitions.ts

import { useState, useEffect, useRef, useCallback } from 'react';

// ✅ Tipos de animación disponibles
export type TransitionType = 
  | 'slide-left'    // Deslizar hacia la izquierda (avanzar)
  | 'slide-right'   // Deslizar hacia la derecha (retroceder)
  | 'fade'          // Desvanecimiento
  | 'scale'         // Escalar
  | 'slide-up'      // Deslizar hacia arriba
  | 'slide-down'    // Deslizar hacia abajo
  | 'zoom-in'       // Zoom hacia adentro
  | 'zoom-out';     // Zoom hacia afuera

export type TransitionDirection = 'forward' | 'backward';

export interface TransitionConfig {
  type: TransitionType;
  duration: number;        // Duración en milisegundos
  easing: string;         // Función de easing CSS
  stagger?: number;       // Retraso entre elementos (para listas)
}

export interface StepTransitionState {
  isTransitioning: boolean;
  currentStep: string;
  previousStep: string | null;
  direction: TransitionDirection;
  progress: number; // 0-1, progreso de la transición
}

export interface UseStepTransitionsReturn {
  // Estado de transición
  transitionState: StepTransitionState;
  
  // Configuración
  config: TransitionConfig;
  setConfig: (config: Partial<TransitionConfig>) => void;
  
  // Acciones
  transitionToStep: (step: string, direction?: TransitionDirection) => Promise<void>;
  skipTransition: () => void;
  
  // Clases CSS para aplicar a elementos
  getStepClasses: (step: string) => string;
  getContentClasses: () => string;
  
  // Helpers para animaciones manuales
  animateElement: (element: HTMLElement, animation: TransitionType) => Promise<void>;
  
  // Estados útiles
  canTransition: boolean;
  isEntering: boolean;
  isExiting: boolean;
}

// ✅ Configuraciones predefinidas por tipo de transición
const DEFAULT_CONFIGS: Record<TransitionType, Partial<TransitionConfig>> = {
  'slide-left': {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  'slide-right': {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  'fade': {
    duration: 200,
    easing: 'ease-in-out'
  },
  'scale': {
    duration: 250,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  'slide-up': {
    duration: 350,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },
  'slide-down': {
    duration: 350,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },
  'zoom-in': {
    duration: 280,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },
  'zoom-out': {
    duration: 280,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }
};

export const useStepTransitions = (
  initialStep: string,
  initialConfig: Partial<TransitionConfig> = {}
): UseStepTransitionsReturn => {
  
  // ✅ Estado principal
  const [transitionState, setTransitionState] = useState<StepTransitionState>({
    isTransitioning: false,
    currentStep: initialStep,
    previousStep: null,
    direction: 'forward',
    progress: 0
  });

  // ✅ Configuración de transición
  const [config, setConfigState] = useState<TransitionConfig>({
    type: 'slide-left',
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    stagger: 50,
    ...DEFAULT_CONFIGS['slide-left'],
    ...initialConfig
  });

  // ✅ Referencias para animaciones
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // ✅ Actualizar configuración
  const setConfig = useCallback((newConfig: Partial<TransitionConfig>) => {
    setConfigState(prev => ({
      ...prev,
      ...newConfig,
      ...DEFAULT_CONFIGS[newConfig.type || prev.type]
    }));
  }, []);

  // ✅ Función principal de transición
  const transitionToStep = useCallback(async (
    newStep: string, 
    direction: TransitionDirection = 'forward'
  ): Promise<void> => {
    
    // Evitar transición si ya está en progreso o es el mismo paso
    if (transitionState.isTransitioning || newStep === transitionState.currentStep) {
      return;
    }

    return new Promise((resolve) => {
      // Iniciar transición
      setTransitionState(prev => ({
        ...prev,
        isTransitioning: true,
        previousStep: prev.currentStep,
        direction,
        progress: 0
      }));

      startTimeRef.current = Date.now();

      // Animar progreso
      const animateProgress = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / config.duration, 1);

        setTransitionState(prev => ({
          ...prev,
          progress
        }));

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateProgress);
        } else {
          // Completar transición
          setTransitionState(prev => ({
            ...prev,
            isTransitioning: false,
            currentStep: newStep,
            previousStep: prev.currentStep,
            progress: 1
          }));
          resolve();
        }
      };

      animationRef.current = requestAnimationFrame(animateProgress);
    });
  }, [transitionState.isTransitioning, transitionState.currentStep, config.duration]);

  // ✅ Saltar transición
  const skipTransition = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setTransitionState(prev => ({
      ...prev,
      isTransitioning: false,
      progress: 1
    }));
  }, []);

  // ✅ Obtener clases CSS para los pasos
  const getStepClasses = useCallback((step: string): string => {
    const { currentStep, previousStep, isTransitioning, direction, progress } = transitionState;
    
    if (!isTransitioning) {
      return step === currentStep ? 'step-active' : 'step-hidden';
    }

    // Durante la transición
    if (step === currentStep) {
      return `step-entering step-entering-${direction} step-${config.type}`;
    }
    
    if (step === previousStep) {
      return `step-exiting step-exiting-${direction} step-${config.type}`;
    }
    
    return 'step-hidden';
  }, [transitionState, config.type]);

  // ✅ Obtener clases para el contenedor
  const getContentClasses = useCallback((): string => {
    const { isTransitioning, direction } = transitionState;
    
    if (!isTransitioning) {
      return 'transition-idle';
    }
    
    return `transition-active transition-${direction} transition-${config.type}`;
  }, [transitionState, config.type]);

  // ✅ Animar elemento específico
  const animateElement = useCallback(async (
    element: HTMLElement, 
    animation: TransitionType
  ): Promise<void> => {
    const animConfig = { ...config, type: animation };
    
    return new Promise((resolve) => {
      element.style.transition = `all ${animConfig.duration}ms ${animConfig.easing}`;
      
      // Aplicar animación inicial
      switch (animation) {
        case 'fade':
          element.style.opacity = '0';
          break;
        case 'scale':
          element.style.transform = 'scale(0.8)';
          break;
        case 'slide-up':
          element.style.transform = 'translateY(20px)';
          element.style.opacity = '0';
          break;
        case 'slide-down':
          element.style.transform = 'translateY(-20px)';
          element.style.opacity = '0';
          break;
        case 'zoom-in':
          element.style.transform = 'scale(1.1)';
          element.style.opacity = '0';
          break;
      }
      
      // Trigger reflow
      element.offsetHeight;
      
      // Animar al estado final
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'none';
        
        setTimeout(() => {
          element.style.transition = '';
          resolve();
        }, animConfig.duration);
      });
    });
  }, [config]);

  // ✅ Estados derivados
  const canTransition = !transitionState.isTransitioning;
  const isEntering = transitionState.isTransitioning && transitionState.progress < 0.5;
  const isExiting = transitionState.isTransitioning && transitionState.progress >= 0.5;

  // ✅ Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    transitionState,
    config,
    setConfig,
    transitionToStep,
    skipTransition,
    getStepClasses,
    getContentClasses,
    animateElement,
    canTransition,
    isEntering,
    isExiting
  };
};

// ✅ Hook simplificado para wizard steps
export const useWizardTransitions = (
  currentStep: string,
  transitionType: TransitionType = 'slide-left'
) => {
  const transitions = useStepTransitions(currentStep, { type: transitionType });
  
  // Auto-configurar dirección basada en el orden de pasos típico
  const stepOrder = ['cliente', 'company', 'seccion', 'operacion', 'upload', 'extract', 'form', 'success'];
  
  const goToStep = useCallback(async (newStep: string) => {
    const currentIndex = stepOrder.indexOf(transitions.transitionState.currentStep);
    const newIndex = stepOrder.indexOf(newStep);
    const direction = newIndex > currentIndex ? 'forward' : 'backward';
    
    // Cambiar tipo de transición según dirección
    if (direction === 'backward' && transitionType === 'slide-left') {
      transitions.setConfig({ type: 'slide-right' });
    } else if (direction === 'forward' && transitionType === 'slide-right') {
      transitions.setConfig({ type: 'slide-left' });
    }
    
    await transitions.transitionToStep(newStep, direction);
  }, [transitions, transitionType, stepOrder]);
  
  return {
    ...transitions,
    goToStep
  };
};

export default useStepTransitions;