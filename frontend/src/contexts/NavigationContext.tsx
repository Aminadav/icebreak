import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define page types
export type PageType = 'home' | 'about' | 'components' | 'giveGameName' | 'enterPhoneNumber';

// Define navigation entry
export interface NavigationEntry {
  page: PageType;
  props?: Record<string, any>;
  timestamp: number;
}

// Define navigation actions
interface NavigationContextType {
  currentPage: PageType;
  navigationStack: NavigationEntry[];
  canGoBack: boolean;
  
  // Navigation methods
  push: (page: PageType, props?: Record<string, any>) => void;
  replace: (page: PageType, props?: Record<string, any>) => void;
  back: () => void;
  reset: (page: PageType, props?: Record<string, any>) => void;
  
  // Helper methods
  getCurrentProps: () => Record<string, any> | undefined;
  getStackSize: () => number;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  initialPage?: PageType;
}

export function NavigationProvider({ children, initialPage = 'home' }: NavigationProviderProps): JSX.Element {
  const [navigationStack, setNavigationStack] = useState<NavigationEntry[]>([
    { page: initialPage, props: {}, timestamp: Date.now() }
  ]);

  const currentEntry = navigationStack[navigationStack.length - 1];
  const currentPage = currentEntry?.page || initialPage;
  const canGoBack = navigationStack.length > 1;

  const push = (page: PageType, props?: Record<string, any>) => {
    console.log(`📱 Navigation: Push ${page}`, props);
    const newEntry: NavigationEntry = {
      page,
      props: props || {},
      timestamp: Date.now()
    };
    setNavigationStack(prev => [...prev, newEntry]);
  };

  const replace = (page: PageType, props?: Record<string, any>) => {
    console.log(`📱 Navigation: Replace current page with ${page}`, props);
    const newEntry: NavigationEntry = {
      page,
      props: props || {},
      timestamp: Date.now()
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

  const reset = (page: PageType, props?: Record<string, any>) => {
    console.log(`📱 Navigation: Reset to ${page}`, props);
    const newEntry: NavigationEntry = {
      page,
      props: props || {},
      timestamp: Date.now()
    };
    setNavigationStack([newEntry]);
  };

  const getCurrentProps = () => {
    return currentEntry?.props;
  };

  const getStackSize = () => {
    return navigationStack.length;
  };

  const value: NavigationContextType = {
    currentPage,
    navigationStack,
    canGoBack,
    push,
    replace,
    back,
    reset,
    getCurrentProps,
    getStackSize
  };

  // Debug logging
  React.useEffect(() => {
    console.log('📱 Navigation Stack:', navigationStack.map(entry => ({ 
      page: entry.page, 
      props: entry.props,
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