// src/components/enhanced/AdvancedAnimations.tsx - ANIMACIONES AVANZADAS
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ==================== ADVANCED ANIMATION COMPONENTS ====================

// 1. Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  direction?: 'slide-right' | 'slide-left' | 'slide-up' | 'slide-down' | 'fade' | 'scale';
  duration?: number;
  className?: string;
  isActive?: boolean;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  direction = 'fade',
  duration = 500,
  className,
  isActive = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsExiting(false);
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsExiting(true);
      const timer = setTimeout(() => setIsVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  const getTransitionClasses = () => {
    const baseClasses = "transition-all ease-out";
    
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
          isVisible && !isExiting ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        );
      case 'slide-down':
        return cn(
          baseClasses,
          isVisible && !isExiting ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        );
      case 'scale':
        return cn(
          baseClasses,
          isVisible && !isExiting ? "scale-100 opacity-100" : "scale-90 opacity-0"
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
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

// 2. Advanced Staggered Container
interface AdvancedStaggeredProps {
  children: React.ReactNode[];
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  staggerDelay?: number;
  initialDelay?: number;
  duration?: number;
  className?: string;
  trigger?: 'immediate' | 'scroll' | 'hover';
  once?: boolean;
}

const AdvancedStaggered: React.FC<AdvancedStaggeredProps> = ({
  children,
  direction = 'up',
  staggerDelay = 100,
  initialDelay = 0,
  duration = 600,
  className,
  trigger = 'immediate',
  once = true
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
        { threshold: 0.1 }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }
  }, [trigger, triggerAnimation]);

  const getItemClasses = (index: number) => {
    const isVisible = visibleItems.has(index);
    const baseClasses = "transition-all ease-out";
    
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
          style={{ transitionDuration: `${duration}ms` }}
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
}

const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isOpen,
  onClose,
  children,
  animation = 'scale',
  backdropAnimation = 'fade',
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsExiting(false);
      // Prevent body scroll
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

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] max-h-[95vh]"
  };

  const getModalClasses = () => {
    const baseClasses = "transition-all duration-300 ease-out";
    
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
          isVisible && !isExiting ? "scale-100 opacity-100" : "scale-50 opacity-0"
        );
      case 'rotate':
        return cn(
          baseClasses,
          isVisible && !isExiting 
            ? "rotate-0 scale-100 opacity-100" 
            : "rotate-12 scale-90 opacity-0"
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
            ? "backdrop-blur-sm bg-black/50" 
            : "backdrop-blur-none bg-black/0"
        );
      case 'fade':
      default:
        return cn(
          baseClasses,
          isVisible && !isExiting ? "bg-black/50" : "bg-black/0"
        );
    }
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={cn("absolute inset-0", getBackdropClasses())}
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      {/* Modal */}
      <div
        className={cn(
          "relative bg-background border border-border rounded-lg shadow-2xl w-full",
          sizeClasses[size],
          getModalClasses()
        )}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            ✕
          </button>
        )}
        
        {/* Content */}
        {children}
      </div>
    </div>
  );
};

// 4. Progressive Loading Component
interface ProgressiveLoadingProps {
  stages: {
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    duration?: number;
  }[];
  currentStage: string;
  onComplete?: () => void;
  showProgress?: boolean;
}

const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  stages,
  currentStage,
  onComplete,
  showProgress = true
}) => {
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const [animatingStage, setAnimatingStage] = useState<string | null>(null);
  
  const currentIndex = stages.findIndex(stage => stage.id === currentStage);
  const progress = ((currentIndex + 1) / stages.length) * 100;

  useEffect(() => {
    const currentStageIndex = stages.findIndex(stage => stage.id === currentStage);
    
    // Mark previous stages as completed
    const newCompleted = new Set<string>();
    for (let i = 0; i < currentStageIndex; i++) {
      newCompleted.add(stages[i].id);
    }
    setCompletedStages(newCompleted);
    
    // Animate current stage
    setAnimatingStage(currentStage);
    
    // Check if we're on the last stage
    if (currentStageIndex === stages.length - 1) {
      const timer = setTimeout(() => {
        setCompletedStages(prev => new Set([...prev, currentStage]));
        onComplete?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStage, stages, onComplete]);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stages */}
      <div className="space-y-4">
        {stages.map((stage) => {
          const isCompleted = completedStages.has(stage.id);
          const isCurrent = stage.id === currentStage;
          const isAnimating = stage.id === animatingStage;
          
          return (
            <div
              key={stage.id}
              className={cn(
                "flex items-center space-x-4 p-4 rounded-lg transition-all duration-500",
                isCompleted && "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",
                isCurrent && "bg-primary/5 border border-primary/20",
                !isCompleted && !isCurrent && "bg-muted/30"
              )}
            >
              {/* Icon/Status */}
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                isCompleted && "bg-green-500 text-white scale-110",
                isCurrent && "bg-primary text-primary-foreground",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : isCurrent ? (
                  <div className={cn(
                    "w-5 h-5 border-2 border-current border-t-transparent rounded-full",
                    isAnimating && "animate-spin"
                  )} />
                ) : (
                  stage.icon || <div className="w-2 h-2 bg-current rounded-full" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "font-medium transition-colors",
                  isCompleted && "text-green-700 dark:text-green-300",
                  isCurrent && "text-primary",
                  !isCompleted && !isCurrent && "text-muted-foreground"
                )}>
                  {stage.label}
                </h4>
                {stage.description && (
                  <p className={cn(
                    "text-sm mt-1 transition-colors",
                    isCompleted && "text-green-600 dark:text-green-400",
                    isCurrent && "text-primary/80",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}>
                    {stage.description}
                  </p>
                )}
              </div>

              {/* Loading indicator for current stage */}
              {isCurrent && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 5. Morphing Button (Advanced Interaction)
interface MorphingButtonProps {
  states: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error';
    loading?: boolean;
  }[];
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
        
        {/* Label with typewriter effect */}
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

// Export all components
export {
  PageTransition,
  AdvancedStaggered,
  AnimatedModal,
  ProgressiveLoading,
  MorphingButton
};