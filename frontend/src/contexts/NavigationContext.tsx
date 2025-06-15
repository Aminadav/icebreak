import React, { createContext, useContext, useState, ReactNode, ReactElement } from 'react';

// Define navigation entry with React component
export interface NavigationEntry {
  component: ReactElement;
  timestamp: number;
  key: string; // Unique key for React rendering
}

// Define navigation actions
interface NavigationContextType {
  navigationStack: NavigationEntry[];
  canGoBack: boolean;
  
  // Navigation methods
  push: (component: ReactElement) => void;
  replace: (component: ReactElement) => void;
  back: () => void;
  reset: (component: ReactElement) => void;
  
  // Helper methods
  getStackSize: () => number;
  getCurrentComponent: () => ReactElement | undefined;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  initialComponent: ReactElement;
}

export function NavigationProvider({ children, initialComponent }: NavigationProviderProps): JSX.Element {
  const [navigationStack, setNavigationStack] = useState<NavigationEntry[]>([
    { 
      component: initialComponent, 
      timestamp: Date.now(),
      key: `initial-${Date.now()}`
    }
  ]);

  const canGoBack = navigationStack.length > 1;

  const push = (component: ReactElement) => {
    console.log('📱 Navigation: Push component', component.type);
    const newEntry: NavigationEntry = {
      component,
      timestamp: Date.now(),
      key: `push-${Date.now()}`
    };
    setNavigationStack(prev => [...prev, newEntry]);
  };

  const replace = (component: ReactElement) => {
    console.log('📱 Navigation: Replace current component with', component.type);
    const newEntry: NavigationEntry = {
      component,
      timestamp: Date.now(),
      key: `replace-${Date.now()}`
    };
    setNavigationStack(prev => {
      const newStack = [...prev];
      newStack[newStack.length - 1] = newEntry;
      return newStack;
    });
  };

  const back = () => {
    if (canGoBack) {
      console.log('📱 Navigation: Back');
      setNavigationStack(prev => prev.slice(0, -1));
    } else {
      console.log('📱 Navigation: Cannot go back, already at root');
    }
  };

  const reset = (component: ReactElement) => {
    console.log('📱 Navigation: Reset to component', component.type);
    const newEntry: NavigationEntry = {
      component,
      timestamp: Date.now(),
      key: `reset-${Date.now()}`
    };
    setNavigationStack([newEntry]);
  };

  const getCurrentComponent = () => {
    return navigationStack[navigationStack.length - 1]?.component;
  };

  const getStackSize = () => {
    return navigationStack.length;
  };

  const value: NavigationContextType = {
    navigationStack,
    canGoBack,
    push,
    replace,
    back,
    reset,
    getCurrentComponent,
    getStackSize
  };
  // Debug logging
  React.useEffect(() => {
    console.log('📱 Navigation Stack:', navigationStack.map(entry => ({ 
      component: typeof entry.component.type === 'string' 
        ? entry.component.type 
        : entry.component.type?.name || 'Anonymous', 
      timestamp: entry.timestamp,
      time: new Date(entry.timestamp).toLocaleTimeString()
    })));
  }, [navigationStack]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}