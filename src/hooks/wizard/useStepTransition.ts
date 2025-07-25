import { useState, useCallback, useRef, useEffect } from 'react';
import { WizardStepId } from '../../types/wizard'; 

export interface TransitionConfig {
  duration?: number; 
  easing?: string;
  direction?: 'horizontal' | 'vertical' | 'fade' | 'scale' | 'slide';
  
  // Configuración avanzada
  enablePreload?: boolean;
  enableGestures?: boolean;
  preventBodyScroll?: boolean;
  respectReducedMotion?: boolean;
  
  // Configuración de animación
  enterDelay?: number;
  exitDelay?: number;
  stagger?: number; // Para elementos múltiples
  
  // Callbacks
  onTransitionStart?: (from: WizardStepId, to: WizardStepId) => void;
  onTransitionEnd?: (from: WizardStepId, to: WizardStepId) => void;
  onTransitionCancel?: () => void;
}

export type TransitionDirection = 'forward' | 'backward' | 'jump';

export type TransitionState = 
  | 'idle' 
  | 'preparing' 
  | 'entering' 
  | 'active' 
  | 'exiting' 
  | 'cancelled';

export interface TransitionStatus {
  state: TransitionState;
  progress: number; // 0-1
  fromStep: WizardStepId | null;
  toStep: WizardStepId | null;
  direction: TransitionDirection;
  startTime: number;
  duration: number;
}

export interface AnimationVariants {
  initial: any;
  animate: any;
  exit: any;
}

export interface UseStepTransitionsReturn {
  // Estado de transición
  isTransitioning: boolean;
  transitionState: TransitionState;
  progress: number;
  
  // Control de transición
  startTransition: (
    fromStep: WizardStepId,
    toStep: WizardStepId,
    direction?: TransitionDirection
  ) => Promise<void>;
  cancelTransition: () => void;
  
  // Configuración dinámica
  updateConfig: (newConfig: Partial<TransitionConfig>) => void;
  
  // Para componentes
  getStepVariants: (stepId: WizardStepId) => AnimationVariants;
  getContainerProps: () => any;
  shouldPreloadStep: (stepId: WizardStepId) => boolean;
  
  // Estado
  currentStatus: TransitionStatus;
  error: string | null;
  
  // Utilidades
  getTransitionStyles: (stepId: WizardStepId) => React.CSSProperties;
  isStepVisible: (stepId: WizardStepId) => boolean;
  canTransition: () => boolean;
}

// ============================================================================
// 🎪 HOOK PRINCIPAL
// ============================================================================

export const useStepTransitions = (
  initialConfig: TransitionConfig = {}
): UseStepTransitionsReturn => {

  const {
    duration = 300,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    direction = 'horizontal',
    enablePreload = true,
    enableGestures = false,
    preventBodyScroll = false,
    respectReducedMotion = true,
    enterDelay = 0,
    exitDelay = 0,
    stagger = 0,
    onTransitionStart,
    onTransitionEnd,
    onTransitionCancel
  } = initialConfig;

  // ============================================================================
  // 📊 ESTADO DEL HOOK
  // ============================================================================

  // Estados principales
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionState, setTransitionState] = useState<TransitionState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Configuración dinámica
  const [config, setConfig] = useState<TransitionConfig>(initialConfig);
  
  // Estado de transición
  const [currentStatus, setCurrentStatus] = useState<TransitionStatus>({
    state: 'idle',
    progress: 0,
    fromStep: null,
    toStep: null,
    direction: 'forward',
    startTime: 0,
    duration: duration
  });

  // Referencias
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null); // ✅ CAMBIADO a number
  const startTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const preloadedStepsRef = useRef<Set<WizardStepId>>(new Set());

  // ============================================================================
  // 🔧 FUNCIONES AUXILIARES - MOVIDAS AL INICIO
  // ============================================================================

  /**
   * Verifica si la transición fue cancelada
   */
  const isCancelled = useCallback((): boolean => {
    return transitionState === 'cancelled';
  }, [transitionState]);

  /**
   * Verifica si puede continuar la transición
   */
  const canContinueTransition = useCallback((): boolean => {
    return transitionState !== 'cancelled' && isTransitioning;
  }, [transitionState, isTransitioning]);

  // ============================================================================
  // 🎬 FUNCIONES DE TRANSICIÓN
  // ============================================================================

  /**
   * Inicia una transición entre pasos
   */
  const startTransition = useCallback(async (
    fromStep: WizardStepId,
    toStep: WizardStepId,
    transitionDirection: TransitionDirection = 'forward'
  ): Promise<void> => {
    // Verificar si ya hay una transición en curso
    if (isTransitioning) {
      console.warn('Transición ya en curso, cancelando anterior');
      cancelTransition();
    }

    // Verificar reduced motion
    if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Transición instantánea
      setCurrentStatus({
        state: 'active',
        progress: 1,
        fromStep,
        toStep,
        direction: transitionDirection,
        startTime: Date.now(),
        duration: 0
      });
      onTransitionEnd?.(fromStep, toStep);
      return;
    }

    setError(null);
    setIsTransitioning(true);
    setTransitionState('preparing');
    
    const startTime = Date.now();
    startTimeRef.current = startTime;

    // Actualizar estado inicial
    const initialStatus: TransitionStatus = {
      state: 'preparing',
      progress: 0,
      fromStep,
      toStep,
      direction: transitionDirection,
      startTime,
      duration: config.duration || duration
    };
    
    setCurrentStatus(initialStatus);
    setProgress(0);

    try {
      // Notificar inicio
      onTransitionStart?.(fromStep, toStep);

      // Prevenir scroll del body si está configurado
      if (preventBodyScroll) {
        document.body.style.overflow = 'hidden';
      }

      // Fase 1: Preparación
      await prepareTransition(fromStep, toStep);
      
      if (transitionState === 'cancelled') return;

      // Fase 2: Salida del paso actual
      setTransitionState('exiting');
      setCurrentStatus(prev => ({ ...prev, state: 'exiting' }));
      
      await animateExit(fromStep, transitionDirection);
      
      if (isCancelled()) return;

      // Fase 3: Entrada del nuevo paso
      setTransitionState('entering');
      setCurrentStatus(prev => ({ ...prev, state: 'entering' }));
      
      await animateEnter(toStep, transitionDirection);
      
      if (isCancelled()) return;

      // Fase 4: Completar transición
      setTransitionState('active');
      setProgress(1);
      setCurrentStatus(prev => ({ 
        ...prev, 
        state: 'active',
        progress: 1 
      }));

      // Restaurar scroll del body
      if (preventBodyScroll) {
        document.body.style.overflow = '';
      }

      // Notificar final
      onTransitionEnd?.(fromStep, toStep);

    } catch (error) {
      console.error('Error en transición:', error);
      setError(error instanceof Error ? error.message : 'Error en transición');
      
      // Limpiar estado en caso de error
      if (preventBodyScroll) {
        document.body.style.overflow = '';
      }
    } finally {
      setIsTransitioning(false);
      setTransitionState('idle');
      
      // Limpiar timeouts y animation frames
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current); // ✅ CAMBIADO
        timeoutRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [
    isTransitioning, respectReducedMotion, config.duration, duration, 
    preventBodyScroll, onTransitionStart, onTransitionEnd, isCancelled
  ]);

  /**
   * Cancela la transición actual
   */
  const cancelTransition = useCallback((): void => {
    if (!isTransitioning) return;

    setTransitionState('cancelled');
    setIsTransitioning(false);
    
    // Limpiar timeouts y animation frames
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current); // ✅ CAMBIADO
      timeoutRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Restaurar scroll del body
    if (preventBodyScroll) {
      document.body.style.overflow = '';
    }

    onTransitionCancel?.();
  }, [isTransitioning, preventBodyScroll, onTransitionCancel]);

  // ============================================================================
  // 🎨 FUNCIONES DE ANIMACIÓN
  // ============================================================================

  /**
   * Prepara la transición
   */
  const prepareTransition = useCallback(async (
    fromStep: WizardStepId,
    toStep: WizardStepId
  ): Promise<void> => {
    // Precargar paso de destino si está habilitado
    if (enablePreload && !preloadedStepsRef.current.has(toStep)) {
      await preloadStep(toStep);
    }

    // Pequeña pausa para permitir que el DOM se actualice
    return new Promise(resolve => {
      timeoutRef.current = window.setTimeout(resolve, 50); // ✅ CAMBIADO
    });
  }, [enablePreload]);

  /**
   * Anima la salida del paso actual
   */
  const animateExit = useCallback(async (
    fromStep: WizardStepId,
    direction: TransitionDirection
  ): Promise<void> => {
    return new Promise((resolve) => {
      const exitDuration = (config.duration || duration) / 2;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / exitDuration, 1);
        
        setProgress(progress * 0.5); // Primera mitad del progreso

        if (progress >= 1) {
          resolve();
        } else if (canContinueTransition()) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      // Agregar delay si está configurado
      if (exitDelay > 0) {
        timeoutRef.current = window.setTimeout(() => { // ✅ CAMBIADO
          animationFrameRef.current = requestAnimationFrame(animate);
        }, exitDelay);
      } else {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    });
  }, [config.duration, duration, exitDelay, canContinueTransition]);

  /**
   * Anima la entrada del nuevo paso
   */
  const animateEnter = useCallback(async (
    toStep: WizardStepId,
    direction: TransitionDirection
  ): Promise<void> => {
    return new Promise((resolve) => {
      const enterDuration = (config.duration || duration) / 2;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / enterDuration, 1);
        
        setProgress(0.5 + (progress * 0.5)); // Segunda mitad del progreso

        if (progress >= 1) {
          resolve();
        } else if (canContinueTransition()) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      // Agregar delay si está configurado
      if (enterDelay > 0) {
        timeoutRef.current = window.setTimeout(() => { // ✅ CAMBIADO
          animationFrameRef.current = requestAnimationFrame(animate);
        }, enterDelay);
      } else {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    });
  }, [config.duration, duration, enterDelay, canContinueTransition]);

  /**
   * Precarga un paso
   */
  const preloadStep = useCallback(async (stepId: WizardStepId): Promise<void> => {
    // Marcar como precargado
    preloadedStepsRef.current.add(stepId);
    
    // Aquí se podría implementar lógica específica de precarga
    // como lazy loading de componentes, prefetch de datos, etc.
    
    return Promise.resolve();
  }, []);

  // ============================================================================
  // 🎨 VARIANTES DE ANIMACIÓN
  // ============================================================================

  /**
   * Obtiene las variantes de animación para un paso
   */
  const getStepVariants = useCallback((stepId: WizardStepId): AnimationVariants => {
    const { fromStep, toStep, direction: transitionDirection } = currentStatus;
    const isCurrentStep = stepId === toStep;
    const isPreviousStep = stepId === fromStep;
    
    // Configuración base según tipo de transición
    const baseVariants = getBaseVariants(config.direction || direction, transitionDirection);
    
    if (isCurrentStep) {
      return {
        initial: baseVariants.enter.initial,
        animate: baseVariants.enter.animate,
        exit: baseVariants.enter.exit
      };
    } else if (isPreviousStep) {
      return {
        initial: baseVariants.exit.initial,
        animate: baseVariants.exit.animate,
        exit: baseVariants.exit.exit
      };
    } else {
      // Paso inactivo
      return {
        initial: { opacity: 0, display: 'none' },
        animate: { opacity: 0, display: 'none' },
        exit: { opacity: 0, display: 'none' }
      };
    }
  }, [currentStatus, config.direction, direction]);

  /**
   * Obtiene variantes base según el tipo de transición
   */
  const getBaseVariants = useCallback((
    animationType: string,
    transitionDirection: TransitionDirection
  ) => {
    const isForward = transitionDirection === 'forward';
    
    switch (animationType) {
      case 'horizontal':
        return {
          enter: {
            initial: { x: isForward ? '100%' : '-100%', opacity: 0 },
            animate: { x: 0, opacity: 1 },
            exit: { x: isForward ? '-100%' : '100%', opacity: 0 }
          },
          exit: {
            initial: { x: 0, opacity: 1 },
            animate: { x: isForward ? '-100%' : '100%', opacity: 0 },
            exit: { x: isForward ? '-100%' : '100%', opacity: 0 }
          }
        };

      case 'vertical':
        return {
          enter: {
            initial: { y: isForward ? '100%' : '-100%', opacity: 0 },
            animate: { y: 0, opacity: 1 },
            exit: { y: isForward ? '-100%' : '100%', opacity: 0 }
          },
          exit: {
            initial: { y: 0, opacity: 1 },
            animate: { y: isForward ? '-100%' : '100%', opacity: 0 },
            exit: { y: isForward ? '-100%' : '100%', opacity: 0 }
          }
        };

      case 'fade':
        return {
          enter: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 }
          },
          exit: {
            initial: { opacity: 1 },
            animate: { opacity: 0 },
            exit: { opacity: 0 }
          }
        };

      case 'scale':
        return {
          enter: {
            initial: { scale: 0.8, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 1.1, opacity: 0 }
          },
          exit: {
            initial: { scale: 1, opacity: 1 },
            animate: { scale: 0.8, opacity: 0 },
            exit: { scale: 0.8, opacity: 0 }
          }
        };

      case 'slide':
        return {
          enter: {
            initial: { x: isForward ? 50 : -50, opacity: 0 },
            animate: { x: 0, opacity: 1 },
            exit: { x: isForward ? -50 : 50, opacity: 0 }
          },
          exit: {
            initial: { x: 0, opacity: 1 },
            animate: { x: isForward ? -50 : 50, opacity: 0 },
            exit: { x: isForward ? -50 : 50, opacity: 0 }
          }
        };

      default:
        return {
          enter: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 }
          },
          exit: {
            initial: { opacity: 1 },
            animate: { opacity: 0 },
            exit: { opacity: 0 }
          }
        };
    }
  }, []);

  // ============================================================================
  // 🔧 UTILIDADES
  // ============================================================================

  /**
   * Actualiza la configuración
   */
  const updateConfig = useCallback((newConfig: Partial<TransitionConfig>): void => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  /**
   * Obtiene props para el contenedor
   */
  const getContainerProps = useCallback(() => {
    return {
      ref: containerRef,
      style: {
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%'
      }
    };
  }, []);

  /**
   * Verifica si un paso debe precargarse
   */
  const shouldPreloadStep = useCallback((stepId: WizardStepId): boolean => {
    return enablePreload && !preloadedStepsRef.current.has(stepId);
  }, [enablePreload]);

  /**
   * Obtiene estilos de transición para un paso
   */
  const getTransitionStyles = useCallback((stepId: WizardStepId): React.CSSProperties => {
    const { fromStep, toStep } = currentStatus;
    const isCurrentStep = stepId === toStep;
    const isPreviousStep = stepId === fromStep;
    
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      transition: `all ${config.duration || duration}ms ${config.easing || easing}`
    };

    if (isCurrentStep || isPreviousStep) {
      return {
        ...baseStyles,
        zIndex: isCurrentStep ? 2 : 1
      };
    }

    return {
      ...baseStyles,
      opacity: 0,
      pointerEvents: 'none',
      zIndex: 0
    };
  }, [currentStatus, config.duration, config.easing, duration, easing]);

  /**
   * Verifica si un paso es visible
   */
  const isStepVisible = useCallback((stepId: WizardStepId): boolean => {
    const { fromStep, toStep } = currentStatus;
    return stepId === fromStep || stepId === toStep;
  }, [currentStatus]);

  /**
   * Verifica si se puede hacer una transición
   */
  const canTransition = useCallback((): boolean => {
    return !isTransitioning && transitionState === 'idle';
  }, [isTransitioning, transitionState]);

  // ============================================================================
  // 🔄 EFECTOS
  // ============================================================================

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current); // ✅ CAMBIADO
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Restaurar scroll del body
      if (preventBodyScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [preventBodyScroll]);

  // ============================================================================
  // 📤 RETURN DEL HOOK
  // ============================================================================

  return {
    // Estado de transición
    isTransitioning,
    transitionState,
    progress,
    
    // Control de transición
    startTransition,
    cancelTransition,
    
    // Configuración dinámica
    updateConfig,
    
    // Para componentes
    getStepVariants,
    getContainerProps,
    shouldPreloadStep,
    
    // Estado
    currentStatus,
    error,
    
    // Utilidades
    getTransitionStyles,
    isStepVisible,
    canTransition
  };
};

export default useStepTransitions;