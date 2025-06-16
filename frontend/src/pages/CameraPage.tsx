import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { useSocket } from '../contexts/SocketContext';
import PictureEnhancementPage from './PictureEnhancementPage';

interface CameraPageProps {
  onPictureCapture?: (imageBlob: Blob) => void;
  phoneNumber?: string;
  userId?: string;
  email?: string;
  name?: string;
  gender?: string;
}

export default function CameraPage({ 
  onPictureCapture, 
  phoneNumber, 
  userId, 
  email, 
  name, 
  gender 
}: CameraPageProps): JSX.Element {
  const { back, push } = useNavigation();
  const { socket } = useSocket();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showSmileText, setShowSmileText] = useState(false);

  useEffect(() => {
    // Update journey state when camera page mounts
    const updateJourneyState = async () => {
      if (socket) {
        try {
          socket.emit('update_journey_state', { 
            journeyState: 'CAMERA_ACTIVE',
            additionalData: {
              phoneNumber,
              userId,
              email,
              name,
              gender
            }
          });
          console.log('📸 Updated journey state to CAMERA_ACTIVE with user data', {
            phoneNumber, userId, email, name, gender
          });
        } catch (error) {
          console.error('Failed to update journey state:', error);
        }
      }
    };

    // Only update if we have the necessary data
    if (phoneNumber && userId && email && name && gender) {
      updateJourneyState();
    }

    startCamera();
    
    // Show smile text after a short delay
    const timer = setTimeout(() => {
      setShowSmileText(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [socket, phoneNumber, userId, email, name, gender]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📸 Starting camera...');

      // Request camera permission with more basic constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      console.log('📸 Camera stream obtained:', stream);
      console.log('📸 Stream tracks:', stream.getVideoTracks());

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        streamRef.current = stream;
        
        console.log('📸 Video element:', video);
        console.log('📸 Video srcObject set to:', video.srcObject);
        console.log('📸 Video dimensions:', video.videoWidth, 'x', video.videoHeight);
        
        // Add event listeners to track video state
        video.addEventListener('loadstart', () => console.log('📸 Video: loadstart'));
        video.addEventListener('loadeddata', () => console.log('📸 Video: loadeddata'));
        video.addEventListener('canplay', () => console.log('📸 Video: canplay'));
        video.addEventListener('canplaythrough', () => console.log('📸 Video: canplaythrough'));
        video.addEventListener('playing', () => console.log('📸 Video: playing'));
        
        // Force play immediately
        try {
          await video.play();
          console.log('📸 Video is playing');
          console.log('📸 Video state after play - paused:', video.paused, 'ended:', video.ended);
          setHasPermission(true);
          setIsLoading(false);
        } catch (playError) {
          console.error('📸 Play error:', playError);
          // Still set permission and stop loading, video might work anyway
          setHasPermission(true);
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('📸 Camera error:', err);
      setError('לא ניתן לגשת למצלמה. אנא בדקו שהרשיתם גישה למצלמה.');
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Cannot get canvas context');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas (mirror it back to normal)
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      return new Promise<void>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            // Call the onPictureCapture callback if provided
            if (onPictureCapture) {
              onPictureCapture(blob);
            }
            
            // Navigate to picture enhancement page
            if (phoneNumber && userId && email && name && gender) {
              push(
                <PictureEnhancementPage 
                  capturedImage={blob}
                  phoneNumber={phoneNumber}
                  userId={userId}
                  email={email}
                  name={name}
                  gender={gender}
                />
              );
            }
          }
          
          // Add a small delay for visual feedback
          setTimeout(() => {
            setIsCapturing(false);
            resolve();
          }, 300);
        }, 'image/jpeg', 0.8);
      });

    } catch (err) {
      console.error('Error capturing photo:', err);
      setIsCapturing(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    back();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Camera View */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="object-cover w-full h-full"
        style={{ 
          transform: 'scaleX(-1)', // Mirror effect for front camera
          backgroundColor: '#000', // Ensure black background
          display: hasPermission ? 'block' : 'none'
        }}
        onLoadedMetadata={() => console.log('📸 Video metadata loaded event')}
        onCanPlay={() => console.log('📸 Video can play event')}
        onPlay={() => console.log('📸 Video play event')}
        onError={(e) => console.error('📸 Video error:', e)}
      />

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-white animate-pulse">מתחיל מצלמה...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="px-8 text-center">
            <div className="mb-4 text-6xl">📷</div>
            <p className="mb-4 text-lg text-white">{error}</p>
            <button
              onClick={startCamera}
              className="px-6 py-3 font-medium text-black transition-colors bg-white rounded-lg hover:bg-gray-100"
            >
              נסה שוב
            </button>
          </div>
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute z-10 flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-full top-6 right-6 bg-black/50 hover:bg-black/70 group"
        data-testid="camera-close-button"
      >
        <svg 
          className="w-6 h-6 text-white transition-transform duration-200 group-hover:scale-110" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Smile Text */}
      {showSmileText && hasPermission && !error && (
        <div className="absolute z-10 transform -translate-x-1/2 top-20 left-1/2">
          <p className="text-2xl font-medium text-center text-white animate-fade-in-bounce">
            תן חיוך...
          </p>
        </div>
      )}

      {/* Capture Button */}
      {hasPermission && !error && (
        <div className="absolute z-10 transform -translate-x-1/2 bottom-8 left-1/2">
          <button
            onClick={capturePhoto}
            disabled={isCapturing}
            data-testid="camera-capture-button"
            className={`w-20 h-20 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
              isCapturing 
                ? 'bg-orange-500 animate-pulse' 
                : 'bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl'
            }`}
          >
            {isCapturing ? (
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full border-4 border-white rounded-full">
                <div className="w-12 h-12 bg-white rounded-full"></div>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Capture Flash Effect */}
      {isCapturing && (
        <div className="absolute inset-0 z-20 bg-white opacity-50 pointer-events-none animate-flash" />
      )}
    </div>
  );
}
