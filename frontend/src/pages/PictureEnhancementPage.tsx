import { useState, useEffect } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { useSocket } from '../contexts/SocketContext';
import ImageGalleryPage from './ImageGalleryPage';

interface PictureEnhancementPageProps {
  capturedImage: Blob;
  phoneNumber: string;
  userId: string;
  email: string;
  name: string;
  gender: string;
}

export default function PictureEnhancementPage({ 
  capturedImage,
  phoneNumber, 
  userId, 
  email, 
  name, 
  gender 
}: PictureEnhancementPageProps): JSX.Element {
  const { back, push } = useNavigation();
  const { socket } = useSocket();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    // Update journey state when enhancement page mounts
    const updateJourneyState = async () => {
      if (socket) {
        try {
          socket.emit('update_journey_state', { 
            journeyState: 'PICTURE_ENHANCEMENT',
            additionalData: {
              phoneNumber,
              userId,
              email,
              name,
              gender
            }
          });
          console.log('📸 Updated journey state to PICTURE_ENHANCEMENT', {
            phoneNumber, userId, email, name, gender
          });
        } catch (error) {
          console.error('Failed to update journey state:', error);
        }
      }
    };

    updateJourneyState();

    // Create object URL for the captured image
    const url = URL.createObjectURL(capturedImage);
    setImageUrl(url);

    // Start uploading the image
    uploadImage();

    // Cleanup URL on unmount
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [socket, capturedImage, phoneNumber, userId, email, name, gender]);

  const uploadImage = async () => {
    if (!socket || !capturedImage) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      console.log('📤 Starting image upload...');

      // Convert blob to base64 for socket transmission
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        const base64WithoutPrefix = base64Data.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        
        console.log('📤 Emitting image upload...');
        socket.emit('upload_pending_image', {
          imageData: base64WithoutPrefix,
          phoneNumber,
          userId,
          email,
          name,
          gender
        });
      };

      reader.onerror = (error) => {
        console.error('📤 Error reading image file:', error);
        setUploadError('שגיאה בקריאת התמונה');
        setIsUploading(false);
      };

      reader.readAsDataURL(capturedImage);

    // Listen for upload response
      const handleUploadResponse = (response: any) => {
        console.log('📤 Upload response:', response);
        setIsUploading(false);
        
        if (response.success) {
          console.log('📤 Image uploaded successfully:', response.imageHash);
          
          // Navigate to image gallery page
          push(
            <ImageGalleryPage 
              originalImageHash={response.imageHash}
              phoneNumber={phoneNumber}
              userId={userId}
              email={email}
              name={name}
              gender={gender}
            />
          );
        } else {
          console.error('📤 Upload failed:', response.error);
          setUploadError('שגיאה בהעלאת התמונה');
        }
      };

      const handleUploadError = (error: any) => {
        console.error('📤 Upload error:', error);
        setUploadError('שגיאה בהעלאת התמונה');
        setIsUploading(false);
      };

      socket.once('upload_pending_image_response', handleUploadResponse);
      socket.once('error', handleUploadError);

    } catch (error) {
      console.error('📤 Error in uploadImage:', error);
      setUploadError('שגיאה בהעלאת התמונה');
      setIsUploading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Image - Blurred and Less Dark */}
      {imageUrl && (
        <div 
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url(${imageUrl})`,
            filter: 'blur(8px) brightness(0.5)',
            transform: 'scaleX(-1)' // Mirror to match camera preview
          }}
        />
      )}

      {/* Dark Overlay - Less Dark */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        {/* Main Text - Moved Higher */}
        <div className="mb-8 -mt-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            מוכנים?
          </h1>
          <div className="text-2xl text-white">
            זה{' '}
            <span className="text-5xl font-extrabold text-orange-500 align-sub">באמת</span>
            {' '}עומד
          </div>
          <div className="mt-2 text-2xl text-white">
            להיות מטורף
          </div>
        </div>

        {/* Scanning Animation - Full Width */}
        <div className="flex items-center justify-center w-full mb-8">
          <img 
            src="/videos/scanning-effect.gif" 
            alt="Scanning effect"
            className="w-full h-auto max-w-md"
            style={{ maxHeight: '200px', objectFit: 'contain' }}
          />
        </div>

        {/* Status Text */}
        <div className="text-center">
          {isUploading && (
            <p className="text-lg text-blue-300 animate-pulse">
              מעלה תמונה...
            </p>
          )}
          {uploadError && (
            <p className="text-lg text-red-400">
              {uploadError}
            </p>
          )}
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={back}
        className="absolute z-20 flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-full top-6 right-6 bg-black/50 hover:bg-black/70 group"
        data-testid="enhancement-close-button"
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
    </div>
  );
}
