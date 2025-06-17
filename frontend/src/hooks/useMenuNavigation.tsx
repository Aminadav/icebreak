import { useNavigate } from 'react-router-dom';

/**
 * Centralized menu navigation hook
 * Handles all menu actions in one place instead of duplicating across components
 */
export function useMenuNavigation() {
  const navigate = useNavigate();

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'about':
        navigate('/about');
        break;
      case 'components':
        navigate('/components');
        break;
      default:
        console.log('Unknown menu action:', action);
    }
  };

  return { handleMenuAction };
}
