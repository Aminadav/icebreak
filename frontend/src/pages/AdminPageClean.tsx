import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

// All available journey states
const JOURNEY_STATES = [
  'INITIAL',
  'GAME_NAME_ENTRY',
  'GAME_NAME_SET', 
  'PHONE_SUBMITTED',
  'PHONE_VERIFIED',
  'EMAIL_SAVED',
  'NAME_SAVED',
  'GENDER_SELECTION',
  'PICTURE_UPLOAD',
  'CAMERA_ACTIVE',
  'PICTURE_ENHANCEMENT',
  'IMAGE_GALLERY',
  'CREATOR_GAME_READY'
];

// Human-readable descriptions for journey states
const STATE_DESCRIPTIONS: Record<string, string> = {
  'INITIAL': 'Starting point - Home page',
  'GAME_NAME_ENTRY': 'Game name entry page',
  'GAME_NAME_SET': 'Game name set, ready for phone number',
  'PHONE_SUBMITTED': 'Phone submitted, waiting for 2FA verification',
  'PHONE_VERIFIED': 'Phone verified, ready for email',
  'EMAIL_SAVED': 'Email saved, ready for name entry',
  'NAME_SAVED': 'Name saved, ready for gender selection',
  'GENDER_SELECTION': 'Gender selection in progress',
  'PICTURE_UPLOAD': 'Picture upload in progress',
  'CAMERA_ACTIVE': 'Camera active for photo capture',
  'PICTURE_ENHANCEMENT': 'Picture enhancement in progress',
  'IMAGE_GALLERY': 'Image gallery selection in progress',
  'CREATOR_GAME_READY': 'Game is ready to play by creator'
};

export default function AdminPageSimple(): JSX.Element {
  const { socket, deviceId, userId } = useSocket();
  const [currentState, setCurrentState] = useState<string>('INITIAL');
  const [selectedState, setSelectedState] = useState<string>('INITIAL');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  // Auto-refresh current state every 500ms
  useEffect(() => {
    if (!autoRefresh || !socket) return;

    const interval = setInterval(() => {
      // Re-register device to get current state
      if (deviceId) {
        socket.emit('register_device', { deviceId });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [socket, deviceId, autoRefresh]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleDeviceRegistered = (data: any) => {
      console.log('🔍 Admin: Device registered response:', data);
      setCurrentState(data.journeyState || 'INITIAL');
      setSelectedState(data.journeyState || 'INITIAL');
      setDeviceInfo(data);
    };

    const handleJourneyStateUpdated = (data: { journeyState: string; success: boolean; message: string }) => {
      console.log('✅ Admin: Journey state updated:', data);
      setIsLoading(false);
      if (data.success) {
        setCurrentState(data.journeyState);
        setSelectedState(data.journeyState);
        setMessage(`✅ Success: ${data.message}`);
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 4000);
      }
    };

    const handleError = (data: { message: string }) => {
      console.error('❌ Admin: Socket error:', data);
      setIsLoading(false);
      setMessage(`❌ Error: ${data.message}`);
    };

    socket.on('device_registered', handleDeviceRegistered);
    socket.on('journey_state_updated', handleJourneyStateUpdated);
    socket.on('error', handleError);

    return () => {
      socket.off('device_registered', handleDeviceRegistered);
      socket.off('journey_state_updated', handleJourneyStateUpdated);
      socket.off('error', handleError);
    };
  }, [socket]);

  // Initial device registration to get current state
  useEffect(() => {
    if (socket && deviceId) {
      socket.emit('register_device', { deviceId });
    }
  }, [socket, deviceId]);

  const handleUpdateState = () => {
    if (!socket || !selectedState) {
      setMessage('❌ Error: No socket connection or state selected');
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    console.log('🎯 Admin: Updating journey state to:', selectedState);
    socket.emit('update_journey_state', { journeyState: selectedState });
  };

  const handleResetToInitial = () => {
    if (!socket) {
      setMessage('❌ Error: No socket connection');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setSelectedState('INITIAL');
    
    console.log('🔄 Admin: Resetting journey state to INITIAL');
    socket.emit('reset_journey_state');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔧 Admin - Journey State Manager</h1>
        
        {/* Device Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📱 Device Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Device ID:</strong> {deviceId || 'Not connected'}</div>
            <div><strong>User ID:</strong> {userId || 'None'}</div>
            <div><strong>Verified:</strong> {deviceInfo?.isVerified ? 'Yes' : 'No'}</div>
            <div><strong>Phone:</strong> {deviceInfo?.phoneNumber || 'Not set'}</div>
            <div><strong>Email:</strong> {deviceInfo?.email || 'Not set'}</div>
            <div><strong>Name:</strong> {deviceInfo?.name || 'Not set'}</div>
            <div><strong>Gender:</strong> {deviceInfo?.gender || 'Not set'}</div>
            <div><strong>Auto-refresh:</strong> 
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`ml-2 px-2 py-1 rounded text-xs ${
                  autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {autoRefresh ? 'ON (500ms)' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Current State Display */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📍 Current Journey State</h2>
          <div className="bg-gray-700 rounded p-4">
            <div className="text-2xl font-mono text-green-400 mb-2">{currentState}</div>
            <div className="text-gray-300">{STATE_DESCRIPTIONS[currentState] || 'Unknown state'}</div>
          </div>
        </div>

        {/* State Selector */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎯 Change Journey State</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="journey-state" className="block text-sm font-medium mb-2">
                Select New Journey State:
              </label>
              <select
                id="journey-state"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                {JOURNEY_STATES.map(state => (
                  <option key={state} value={state}>
                    {state} - {STATE_DESCRIPTIONS[state]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleUpdateState}
                disabled={isLoading || selectedState === currentState}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? '⏳ Updating...' : '🚀 Update State'}
              </button>
              
              <button
                onClick={handleResetToInitial}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                🔄 Reset to INITIAL
              </button>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`rounded-lg p-4 mb-6 ${
            message.includes('Error') ? 'bg-red-900 border border-red-600' : 'bg-green-900 border border-green-600'
          }`}>
            <div className="font-medium">{message}</div>
          </div>
        )}

        {/* Available States Reference */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Journey States Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {JOURNEY_STATES.map(state => (
              <div key={state} className={`p-2 rounded ${
                state === currentState ? 'bg-green-900 border border-green-600' : 'bg-gray-700'
              }`}>
                <div className="font-mono text-blue-300">{state}</div>
                <div className="text-gray-400 text-xs">{STATE_DESCRIPTIONS[state]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>🔐 Secret Admin Panel - Journey State Management</p>
          <p>Auto-refresh: {autoRefresh ? 'Every 500ms' : 'Disabled'}</p>
        </div>
      </div>
    </div>
  );
}
