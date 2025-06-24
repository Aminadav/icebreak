import { useEffect } from 'react';

/**
 * Custom hook that listens for click events on the document and executes a callback function
 */
export function useDocumentOnClick(callback: (event: MouseEvent) => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;
    document.body.style.cursor = 'pointer';

    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const button = target.closest(    'button, input, textarea, select, label, a, summary, area, iframe,[contenteditable="true"], [role="button"], [role="link"], [role="menuitem"], [role="tab"]');
      if (button) return;

      callback(event);
    }

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      document.body.style.cursor = 'default';
    }
  }, [callback, enabled]);
}