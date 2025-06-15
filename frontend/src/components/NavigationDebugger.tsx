import { useNavigation } from '../contexts/NavigationContext';

interface NavigationDebuggerProps {
  show?: boolean;
}

export default function NavigationDebugger({ show = true }: NavigationDebuggerProps): JSX.Element | null {
  const { navigationStack, canGoBack } = useNavigation();
  
  if (!show) return null;

  const getCurrentComponentName = () => {
    const currentEntry = navigationStack[navigationStack.length - 1];
    if (!currentEntry) return 'None';
    
    const componentType = currentEntry.component.type;
    if (typeof componentType === 'string') {
      return componentType;
    } else if (componentType && 'name' in componentType) {
      return componentType.name;
    }
    return 'Anonymous';
  };

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="mb-2 font-bold text-green-400">📱 Navigation Debug</div>
      <div className="mb-1">
        <span className="text-blue-400">Current:</span> {getCurrentComponentName()}
      </div>
      <div className="mb-1">
        <span className="text-blue-400">Can Back:</span> {canGoBack ? '✅' : '❌'}
      </div>
      <div className="mb-1">
        <span className="text-blue-400">Stack ({navigationStack.length}):</span>
      </div>
      <div className="ml-2 space-y-1">
        {navigationStack.map((entry, index) => {
          const componentType = entry.component.type;
          const componentName = typeof componentType === 'string' 
            ? componentType 
            : (componentType && 'name' in componentType ? componentType.name : 'Anonymous');
          
          return (
            <div key={entry.key} className={index === navigationStack.length - 1 ? 'text-yellow-400' : 'text-gray-400'}>
              {index + 1}. {componentName}
            </div>
          );
        })}
      </div>
    </div>
  );
}
