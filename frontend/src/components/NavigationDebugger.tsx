import { useNavigation } from '../contexts/NavigationContext';

interface NavigationDebuggerProps {
  show?: boolean;
}

export default function NavigationDebugger({ show = true }: NavigationDebuggerProps): JSX.Element | null {
  const { navigationStack, currentPage, canGoBack } = useNavigation();

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="mb-2 font-bold text-green-400">📱 Navigation Debug</div>
      <div className="mb-1">
        <span className="text-blue-400">Current:</span> {currentPage}
      </div>
      <div className="mb-1">
        <span className="text-blue-400">Can Back:</span> {canGoBack ? '✅' : '❌'}
      </div>
      <div className="mb-1">
        <span className="text-blue-400">Stack ({navigationStack.length}):</span>
      </div>
      <div className="ml-2 space-y-1">
        {navigationStack.map((entry, index) => (
          <div key={entry.timestamp} className={index === navigationStack.length - 1 ? 'text-yellow-400' : 'text-gray-400'}>
            {index + 1}. {entry.page}
            {entry.props && Object.keys(entry.props).length > 0 && (
              <span className="text-purple-400"> ({Object.keys(entry.props).join(', ')})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
