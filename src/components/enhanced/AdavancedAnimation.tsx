// src/components/enhanced/AdvancedAnimations.tsx - VERSIÓN COMPLETA
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

// ==================== ADVANCED ANIMATION COMPONENTS ====================

// 1. Page Transition Wrapper - Para transiciones entre páginas del wizard
interface PageTransitionProps {
  children: React.ReactNode;
  direction?: 'slide-right' | 'slide-left' | 'slide-up' | 'slide-down' | 'fade' | 'scale';
  duration?: number;
  className?: string;
  isActive?: boolean;
  delay?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  direction = 'fade',
  duration = 500,
  className,
  isActive = true,
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsExiting(false);
      const timer = setTimeout(() => setIsVisible(true), delay + 50);
      return () => clearTimeout(timer);
    } else {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, delay]);

  const getTransitionClasses = () => {
    const baseClasses = "transition-all ease-spring";
    
    switch (direction) {
      case 'slide-right':
        return cn(
          baseClasses,
          isVisible && !isExiting ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        );
      case 'slide-left':
        return cn(
          baseClasses,
          isVisible && !isExiting ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        );
      case 'slide-up':
        return cn(
          baseClasses,
          isVisible && !isExiting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        );
      case 'slide-down':
        return cn(
          baseClasses,
          isVisible && !isExiting ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
        );
      case 'scale':
        return cn(
          baseClasses,
          isVisible && !isExiting ? "scale-100 opacity-100" : "scale-95 opacity-0"
        );
      case 'fade':
      default:
        return cn(
          baseClasses,
          isVisible && !isExiting ? "opacity-100" : "opacity-0"
        );
    }
  };

  return (
    <div
      className={cn(
        getTransitionClasses(),
        className
      )}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }}
    >
      {children}
    </div>
  );
};

// 2. Advanced Staggered Container - Para listas de elementos
interface AdvancedStaggeredProps {
  children: React.ReactNode[];
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  staggerDelay?: number;
  initialDelay?: number;
  duration?: number;
  className?: string;
  trigger?: 'immediate' | 'scroll' | 'hover';
  once?: boolean;
  threshold?: number;
}

const AdvancedStaggered: React.FC<AdvancedStaggeredProps> = ({
  children,
  direction = 'up',
  staggerDelay = 100,
  initialDelay = 0,
  duration = 600,
  className,
  trigger = 'immediate',
  once = true,
  threshold = 0.1
}) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [hasTriggered, setHasTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerAnimation = useCallback(() => {
    if (once && hasTriggered) return;
    
    setHasTriggered(true);
    setVisibleItems(new Set());
    
    children.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, initialDelay + (index * staggerDelay));
    });
  }, [children, initialDelay, staggerDelay, once, hasTriggered]);

  useEffect(() => {
    if (trigger === 'immediate') {
      triggerAnimation();
    } else if (trigger === 'scroll') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            triggerAnimation();
          }
        },
        { threshold }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }
  }, [trigger, triggerAnimation, threshold]);

  const getItemClasses = (index: number) => {
    const isVisible = visibleItems.has(index);
    const baseClasses = "transition-all ease-spring";
    
    switch (direction) {
      case 'up':
        return cn(
          baseClasses,
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        );
      case 'down':
        return cn(
          baseClasses,
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
        );
      case 'left':
        return cn(
          baseClasses,
          isVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
        );
      case 'right':
        return cn(
          baseClasses,
          isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
        );
      case 'scale':
        return cn(
          baseClasses,
          isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        );
      case 'fade':
      default:
        return cn(
          baseClasses,
          isVisible ? "opacity-100" : "opacity-0"
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseEnter={trigger === 'hover' ? triggerAnimation : undefined}
    >
      {children.map((child, index) => (
        <div
          key={index}
          className={getItemClasses(index)}
          style={{ 
            transitionDuration: `${duration}ms`,
            transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// 3. Enhanced Modal with Advanced Animations
interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animation?: 'scale' | 'slide-up' | 'slide-down' | 'fade' | 'zoom' | 'rotate';
  backdropAnimation?: 'fade' | 'blur';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isOpen,
  onClose,
  children,
  animation = 'scale',
  backdropAnimation = 'blur',
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsExiting(false);
      document.body.style.overflow = 'hidden';
    } else {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = 'unset';
      }, 300);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] max-h-[95vh]"
  };

  const getModalClasses = () => {
    const baseClasses = "transition-all duration-300 ease-spring";
    
    switch (animation) {
      case 'scale':
        return cn(
          baseClasses,
          isVisible && !isExiting ? "scale-100 opacity-100" : "scale-90 opacity-0"
        );
      case 'slide-up':
        return cn(
          baseClasses,
          isVisible && !isExiting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        );
      case 'slide-down':
        return cn(
          baseClasses,
          isVisible && !isExiting ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
        );
      case 'zoom':
        return cn(
          baseClasses,
          isVisible && !isExiting ? "scale-100 opacity-100" : "scale-110 opacity-0"
        );
      case 'rotate':
        return cn(
          baseClasses,
          isVisible && !isExiting ? "rotate-0 scale-100 opacity-100" : "rotate-12 scale-90 opacity-0"
        );
      case 'fade':
      default:
        return cn(
          baseClasses,
          isVisible && !isExiting ? "opacity-100" : "opacity-0"
        );
    }
  };

  const getBackdropClasses = () => {
    const baseClasses = "transition-all duration-300";
    
    switch (backdropAnimation) {
      case 'blur':
        return cn(
          baseClasses,
          isVisible && !isExiting 
            ? "opacity-100 backdrop-blur-sm" 
            : "opacity-0 backdrop-blur-none"
        );
      case 'fade':
      default:
        return cn(
          baseClasses,
          isVisible && !isExiting ? "opacity-100" : "opacity-0"
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50",
          getBackdropClasses()
        )}
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div
        className={cn(
          "relative bg-background border rounded-lg shadow-xl w-full",
          sizeClasses[size],
          getModalClasses(),
          className
        )}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {children}
      </div>
    </div>
  );
};

// 4. Progressive Loading with Advanced Animations
interface ProgressiveLoadingStage {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
}

interface ProgressiveLoadingProps {
  stages: ProgressiveLoadingStage[];
  currentStage: string;
  onComplete?: () => void;
  showProgress?: boolean;
  className?: string;
}

const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  stages,
  currentStage,
  onComplete,
  showProgress = true,
  className
}) => {
  const currentIndex = stages.findIndex(stage => stage.id === currentStage);
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 0;

  useEffect(() => {
    if (currentStage === stages[stages.length - 1]?.id && onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStage, stages, onComplete]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progreso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stages */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isActive = stage.id === currentStage;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={stage.id}
              className={cn(
                "flex items-center space-x-4 p-4 rounded-lg border transition-all duration-500",
                isActive && "bg-primary/5 border-primary shadow-lg scale-105",
                isCompleted && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                isPending && "bg-muted/30 border-dashed opacity-60"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                isActive && "bg-primary text-white animate-pulse scale-110",
                isCompleted && "bg-green-500 text-white",
                isPending && "bg-muted text-muted-foreground"
              )}>
                {stage.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "font-medium transition-colors",
                  isActive && "text-primary",
                  isCompleted && "text-green-600 dark:text-green-400",
                  isPending && "text-muted-foreground"
                )}>
                  {stage.label}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {stage.description}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex-shrink-0">
                {isCompleted && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                {isActive && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 5. Morphing Button para diferentes estados
interface ButtonState {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  loading?: boolean;
}

interface MorphingButtonProps {
  states: ButtonState[];
  currentState: string;
  onClick?: (stateId: string) => void;
  disabled?: boolean;
  className?: string;
}

const MorphingButton: React.FC<MorphingButtonProps> = ({
  states,
  currentState,
  onClick,
  disabled = false,
  className
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentStateData = states.find(state => state.id === currentState);

  const handleClick = () => {
    if (disabled || !currentStateData || currentStateData.loading) return;
    
    setIsTransitioning(true);
    onClick?.(currentState);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  };

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return "bg-primary text-primary-foreground hover:bg-primary/90";
      case 'secondary':
        return "bg-secondary text-secondary-foreground hover:bg-secondary/90";
      case 'success':
        return "bg-green-500 text-white hover:bg-green-600";
      case 'error':
        return "bg-red-500 text-white hover:bg-red-600";
      default:
        return "bg-background text-foreground border border-border hover:bg-accent";
    }
  };

  if (!currentStateData) return null;

  return (
    <button
      onClick={handleClick}
      disabled={disabled || currentStateData.loading}
      className={cn(
        "relative inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300 overflow-hidden",
        "hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        getVariantClasses(currentStateData.variant),
        isTransitioning && "scale-95",
        className
      )}
    >
      {/* Morphing content */}
      <div className={cn(
        "flex items-center space-x-2 transition-all duration-200",
        currentStateData.loading && "opacity-60 scale-95"
      )}>
        {/* Icon with morph animation */}
        {(currentStateData.icon || currentStateData.loading) && (
          <div className="relative w-5 h-5 flex items-center justify-center">
            {currentStateData.loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="transition-all duration-300 hover:scale-110">
                {currentStateData.icon}
              </div>
            )}
          </div>
        )}
        
        {/* Label with morphing effect */}
        <span className="transition-all duration-300">
          {currentStateData.label}
        </span>
      </div>

      {/* Ripple effect */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-white/20 rounded-lg animate-ping" />
      )}
    </button>
  );
};

// ==================== CUSTOM HOOK ====================

const useAdvancedAnimations = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animate = useCallback((element: HTMLElement, animation: string, duration: number = 1000) => {
    element.style.animation = `${animation} ${duration}ms ease-out`;
    
    setTimeout(() => {
      element.style.animation = '';
    }, duration);
  }, []);

  const staggerChildren = useCallback((
    container: HTMLElement, 
    delay: number = 100,
    animation: string = 'fadeInUp'
  ) => {
    const children = Array.from(container.children) as HTMLElement[];
    
    children.forEach((child, index) => {
      setTimeout(() => {
        animate(child, animation);
      }, index * delay);
    });
  }, [animate]);

  return {
    isVisible,
    elementRef,
    animate,
    staggerChildren
  };
};

// ================================================================================================
// ✅ EXPORTACIONES - ESTAS VAN AL FINAL DEL ARCHIVO
// ================================================================================================

export {
  PageTransition,
  AdvancedStaggered,
  AnimatedModal,
  ProgressiveLoading,
  MorphingButton,
  useAdvancedAnimations
};