import { useEffect, useState, RefObject } from 'react';

export function useIsVisible(ref: RefObject<HTMLElement>): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      if (!ref.current) return;

      const element = ref.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;

      // Check if element is within viewport
      const isInViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= windowHeight &&
        rect.right <= windowWidth
      ) || (
        // Also consider partially visible elements
        rect.top < windowHeight &&
        rect.bottom > 0 &&
        rect.left < windowWidth &&
        rect.right > 0
      );

      setIsVisible(isInViewport);
    };

    // Check initial visibility
    checkVisibility();

    // Add scroll listener
    const handleScroll = () => {
      checkVisibility();
    };

    document.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [ref]);

  return isVisible;
}
