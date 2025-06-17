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
  'CREATOR_GAME_READY',
  'BEFORE_START_ASK_ABOUT_YOU'
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
  'CREATOR_GAME_READY': 'Game is ready to play by creator',
  'BEFORE_START_ASK_ABOUT_YOU': 'Pre-game questions introduction page'
};

export default function AdminPageSimple(): JSX.Element {
  const { socket, deviceId, userId } = useSocket();
  const [currentState, setCurrentState] = useState<string>('INITIAL');
  const [selectedState, setSelectedState] = useState<string>('INITIAL');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);


  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleDeviceRegistered = (data: any) => {
      console.log('🔍 Admin: Device registered response:', data);
      setCurrentState(data.journeyState || 'INITIAL');
      setSelectedState(data.journeyState || 'INITIAL');
      setDeviceInfo(data);
      setIsLoading(false); // Reset loading state when device registration completes
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

  const handleUpdateState = (newState?: string) => {
    const stateToUpdate = newState || selectedState;
    if (!socket || !stateToUpdate) {
      setMessage('❌ Error: No socket connection or state selected');
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    console.log('🎯 Admin: Updating journey state to:', stateToUpdate);
    socket.emit('update_journey_state', { journeyState: stateToUpdate });
  };

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    // Automatically update the state when dropdown changes
    handleUpdateState(newState);
  };

  return (
    <div className="min-h-screen p-8 text-white bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-center">🔧 Admin - Journey State Manager</h1>
        
        {/* State Selector */}
        <div className="p-6 mb-6 bg-gray-800 rounded-lg">

        {/* Status Message */}
        <div className={`${message ? '' : 'invisible'} rounded-lg p-4 mb-6 ${
          message.includes('Error') ? 'bg-red-900 border border-red-600' : 'bg-green-900 border border-green-600'
        }`}>
          <div className="font-medium">{message}&nbsp;</div>
        </div>

        {/* Available States Reference */}
        <div className="p-6 bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            {JOURNEY_STATES.map(state => (
              <button
                key={state}
                onClick={() => handleStateChange(state)}
                disabled={isLoading}
                className={`p-2 rounded text-left transition-colors hover:bg-opacity-80 disabled:cursor-not-allowed ${
                  state === currentState 
                    ? 'bg-green-900 border border-green-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="font-mono text-blue-300">{state}</div>
                <div className="text-xs text-gray-400">{STATE_DESCRIPTIONS[state]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Device Info */}
        <div className="p-6 mb-6 bg-gray-800 rounded-lg">
          <h2 className="mb-4 text-xl font-semibold">📱 Device Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Device ID:</strong> {deviceId || 'Not connected'}</div>
            <div><strong>User ID:</strong> {userId || 'None'}</div>
            <div><strong>Verified:</strong> {deviceInfo?.isVerified ? 'Yes' : 'No'}</div>
            <div><strong>Phone:</strong> {deviceInfo?.phoneNumber || 'Not set'}</div>
            <div><strong>Email:</strong> {deviceInfo?.email || 'Not set'}</div>
            <div><strong>Name:</strong> {deviceInfo?.name || 'Not set'}</div>
            <div><strong>Gender:</strong> {deviceInfo?.gender || 'Not set'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}