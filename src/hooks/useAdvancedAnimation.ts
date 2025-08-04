import { useCallback, useEffect, useRef, useState } from "react";

export const useAdvancedAnimations = () => {
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
