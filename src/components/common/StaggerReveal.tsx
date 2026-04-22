import { ReactNode, useEffect, useRef, useState, CSSProperties, Children, cloneElement, isValidElement } from 'react';

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  duration?: number;
  threshold?: number;
}

const StaggerReveal = ({
  children,
  className = '',
  staggerDelay = 100,
  duration = 600,
  threshold = 0.1,
}: StaggerRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    if (mediaQuery.matches) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  const childArray = Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return child;

        const style: CSSProperties = prefersReducedMotion
          ? {}
          : {
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(2rem)',
              transition: `opacity ${duration}ms ease-out ${index * staggerDelay}ms, transform ${duration}ms ease-out ${index * staggerDelay}ms`,
              willChange: isVisible ? 'auto' : 'opacity, transform',
            };

        return cloneElement(child, {
          ...child.props,
          style: { ...child.props.style, ...style },
          key: child.key || index,
        });
      })}
    </div>
  );
};

export default StaggerReveal;