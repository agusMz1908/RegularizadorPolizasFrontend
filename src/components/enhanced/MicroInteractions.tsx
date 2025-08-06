// src/components/enhanced/MicroInteractions.tsx - CORREGIDO CON VARIANT OUTLINE
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// ==================== MICRO-INTERACTION COMPONENTS (CSS ONLY) ====================

// 1. Enhanced Card with CSS-only Micro-interactions
interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'interactive' | 'floating' | 'minimal';
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
  clickEffect?: 'ripple' | 'bounce' | 'scale' | 'none';
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  className,
  onClick,
  disabled = false,
  variant = 'default',
  hoverEffect = 'lift',
  clickEffect = 'ripple'
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !onClick) return;
    
    setIsClicked(true);
    
    // Ripple effect
    if (clickEffect === 'ripple') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { id: Date.now(), x, y };
      
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
    
    onClick();
    setTimeout(() => setIsClicked(false), 150);
  };

  const variants = {
    default: "bg-card border border-border shadow-sm",
    interactive: "bg-card border border-border shadow-md hover:shadow-lg",
    floating: "bg-card border-0 shadow-lg hover:shadow-xl",
    minimal: "bg-transparent border border-border/50"
  };

  const hoverEffects = {
    lift: "hover:-translate-y-1 hover:shadow-lg",
    scale: "hover:scale-[1.02]",
    glow: "hover:shadow-2xl hover:shadow-primary/25",
    none: ""
  };

  const clickEffects = {
    bounce: isClicked ? "animate-pulse" : "",
    scale: isClicked ? "scale-95" : "",
    ripple: "overflow-hidden",
    none: ""
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative rounded-lg transition-all duration-300 cursor-pointer",
        variants[variant],
        hoverEffects[hoverEffect],
        clickEffects[clickEffect],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleClick}
    >
      {children}
      
      {/* CSS-only Ripple Effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute bg-primary/30 rounded-full pointer-events-none animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '0.6s',
            animationIterationCount: 1
          }}
        />
      ))}
    </div>
  );
};

// 2. Enhanced Button with CSS Loading States - ✅ CORREGIDO CON VARIANT OUTLINE
interface EnhancedButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'gradient' | 'outline';  // ✅ AGREGADO 'outline'
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loadingText?: string;
}

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  className,
  onClick,
  disabled = false,
  loading = false,
  variant = 'default',
  size = 'md',
  icon,
  loadingText = 'Cargando...'
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    default: "bg-background text-foreground border border-border hover:bg-accent",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90", 
    ghost: "bg-transparent text-foreground hover:bg-accent",
    gradient: "bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg",
    outline: "bg-transparent text-foreground border border-border hover:bg-accent hover:text-accent-foreground"  // ✅ AGREGADO
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base", 
    lg: "px-6 py-3 text-lg"
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
        "hover:scale-[1.02] active:scale-[0.98]",
        variants[variant],
        sizes[size],
        isPressed && "scale-95",
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-current/20 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "flex items-center space-x-2 transition-all duration-200",
        loading && "opacity-30 scale-95"
      )}>
        {icon && <span>{icon}</span>}
        <span>{loading && loadingText ? loadingText : children}</span>
      </div>

      {/* Shine effect for gradient buttons */}
      {variant === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] hover:translate-x-[200%] transition-transform duration-600 ease-in-out" />
      )}
    </button>
  );
};

// 3. Loading Skeleton with CSS Animation
interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  lines?: number;
  animated?: boolean;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'rectangular',
  lines = 1,
  animated = true
}) => {
  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full aspect-square",
    rectangular: "h-8 rounded-md"
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "bg-muted",
              variants[variant],
              animated && "animate-pulse",
              index === lines - 1 && "w-3/4", // Last line shorter
              className
            )}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-muted",
        variants[variant],
        animated && "animate-pulse",
        className
      )}
    />
  );
};

// 4. Notification Toast with CSS Animations
interface NotificationToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  icon?: React.ReactNode;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type = 'info',
  duration = 4000,
  onClose,
  icon
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-green-500 text-white border-green-400/20",
    error: "bg-red-500 text-white border-red-400/20",
    warning: "bg-yellow-500 text-black border-yellow-400/20",
    info: "bg-blue-500 text-white border-blue-400/20"
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg backdrop-blur-sm max-w-md transition-all duration-300",
        typeStyles[type],
        isExiting 
          ? "opacity-0 translate-y-[-50px] scale-90" 
          : "opacity-100 translate-y-0 scale-100"
      )}
    >
      <div className="flex items-center space-x-3">
        {icon && <span>{icon}</span>}
        <p className="font-medium">{message}</p>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose?.();
            }, 300);
          }}
          className="ml-auto text-current/60 hover:text-current transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// 5. Progress Bar with CSS Animations
interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  className,
  showLabel = false,
  animated = true,
  color = 'primary'
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(percentage);
    }
  }, [percentage, animated]);

  const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary", 
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500"
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progreso</span>
          <span className="font-medium">{Math.round(displayValue)}%</span>
        </div>
      )}
      
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            colorClasses[color]
          )}
          style={{ width: `${displayValue}%` }}
        />
      </div>
    </div>
  );
};

// 6. Floating Action Button with CSS Effects
interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  className?: string;
  tooltip?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  className,
  tooltip
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl flex items-center justify-center z-50 transition-all duration-200",
          "hover:scale-110 active:scale-95 hover:-translate-y-1",
          className
        )}
        onClick={onClick}
        onMouseEnter={() => {
          setIsHovered(true);
          setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTooltip(false);
        }}
      >
        <div className={cn(
          "transition-transform duration-300",
          isHovered && "rotate-180"
        )}>
          {icon}
        </div>
      </button>

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div className={cn(
          "fixed bottom-20 right-6 bg-background text-foreground px-3 py-2 rounded-md shadow-lg border text-sm whitespace-nowrap z-50 transition-all duration-200",
          showTooltip 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-2 pointer-events-none"
        )}>
          {tooltip}
        </div>
      )}
    </div>
  );
};

// 7. Staggered List with CSS Animations
interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className,
  staggerDelay = 0.1,
  direction = 'up'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const directionClasses = {
    up: "translate-y-4",
    down: "-translate-y-4",
    left: "-translate-x-4",
    right: "translate-x-4"
  };

  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            "transition-all duration-500 ease-out",
            isVisible 
              ? "opacity-100 translate-x-0 translate-y-0" 
              : `opacity-0 ${directionClasses[direction]}`
          )}
          style={{
            transitionDelay: `${index * staggerDelay}s`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// 8. Hover Reveal with CSS
interface HoverRevealProps {
  children: React.ReactNode;
  revealContent: React.ReactNode;
  className?: string;
  direction?: 'top' | 'bottom' | 'left' | 'right';
}

const HoverReveal: React.FC<HoverRevealProps> = ({
  children,
  revealContent,
  className,
  direction = 'top'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const directionClasses = {
    top: isHovered ? "translate-y-0" : "-translate-y-full",
    bottom: isHovered ? "translate-y-0" : "translate-y-full",
    left: isHovered ? "translate-x-0" : "-translate-x-full",
    right: isHovered ? "translate-x-0" : "translate-x-full"
  };

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      <div className={cn(
        "absolute inset-0 bg-primary/90 text-primary-foreground flex items-center justify-center transition-transform duration-300 ease-out",
        directionClasses[direction]
      )}>
        {revealContent}
      </div>
    </div>
  );
};

// 9. Simple Particle Background (CSS-only alternative)
interface ParticleBackgroundProps {
  density?: number;
  color?: string;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  density = 20,
  color = 'rgb(59, 130, 246)'
}) => {
  const particles = Array.from({ length: density }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    animationDelay: Math.random() * 15,
    animationDuration: 10 + Math.random() * 10,
    size: 2 + Math.random() * 4
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-20 animate-bounce"
          style={{
            left: `${particle.left}%`,
            bottom: '-10px',
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration}s`,
            animationIterationCount: 'infinite',
            animationDirection: 'alternate'
          }}
        />
      ))}
    </div>
  );
};

// 10. Progressive Loading Component - ✅ AGREGADO PARA DocumentScanner
interface ProgressiveLoadingProps {
  stages: Array<{
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    duration: number;
  }>;
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
  const currentIndex = stages.findIndex(stage => stage.id === currentStage);
  const progress = ((currentIndex + 1) / stages.length) * 100;

  useEffect(() => {
    if (currentStage === stages[stages.length - 1].id && onComplete) {
      onComplete();
    }
  }, [currentStage, stages, onComplete]);

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => {
        const isActive = stage.id === currentStage;
        const isCompleted = index < currentIndex;
        
        return (
          <div
            key={stage.id}
            className={cn(
              "flex items-center space-x-4 p-4 rounded-lg transition-all duration-300",
              isActive && "bg-primary/10 scale-[1.02]",
              isCompleted && "opacity-60",
              !isActive && !isCompleted && "opacity-30"
            )}
          >
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
              isActive && "bg-primary text-primary-foreground animate-pulse",
              isCompleted && "bg-green-500 text-white",
              !isActive && !isCompleted && "bg-muted"
            )}>
              {stage.icon}
            </div>
            
            <div className="flex-1">
              <h4 className={cn(
                "font-medium transition-colors duration-300",
                isActive && "text-primary",
                isCompleted && "text-green-600"
              )}>
                {stage.label}
              </h4>
              <p className="text-sm text-muted-foreground">
                {stage.description}
              </p>
            </div>
            
            {isActive && (
              <div className="flex-shrink-0">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {isCompleted && (
              <div className="flex-shrink-0 text-green-500">
                ✓
              </div>
            )}
          </div>
        );
      })}
      
      {showProgress && (
        <AnimatedProgress
          value={progress}
          showLabel={false}
          color="primary"
          className="mt-4"
        />
      )}
    </div>
  );
};

export {
  EnhancedCard,
  EnhancedButton,
  LoadingSkeleton,
  NotificationToast,
  AnimatedProgress,
  FloatingActionButton,
  StaggeredList,
  HoverReveal,
  ParticleBackground,
  ProgressiveLoading  // ✅ EXPORTADO
};