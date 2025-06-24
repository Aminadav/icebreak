import { useEffect } from 'react';

/**
 * Custom hook that listens for Enter key press and executes a callback function
 * @param callback - Function to execute when Enter key is pressed
 * @param enabled - Whether the hook should be active (default: true)
 */
export function useOnEnter(callback: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [callback, enabled]);
}
