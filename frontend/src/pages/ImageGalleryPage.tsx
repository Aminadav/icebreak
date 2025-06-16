import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { useNavigation } from '../contexts/NavigationContext';
import { useSocket } from '../contexts/SocketContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageGalleryPageProps {
  originalImageHash: string;
  phoneNumber: string;
  userId: string;
  email: string;
  name: string;
  gender: string;
}

interface GalleryImage {
  id: number;
  imageHash?: string;
  isLoading: boolean;
  isReady: boolean;
}

export default function ImageGalleryPage({ 
  originalImageHash,
  phoneNumber, 
  userId, 
  email, 
  name, 
  gender 
}: ImageGalleryPageProps): JSX.Element {
  const { back, push } = useNavigation();
  const { socket } = useSocket();
  const { texts } = useLanguage();
  
  // Get backend URL from environment
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  
  // State for 6 gallery images (1 original + 5 generated)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => 
    Array.from({ length: 6 }, (_, index) => ({
      id: index,
      isLoading: true,
      isReady: false
    }))
  );
  
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    // Update journey state when gallery page mounts
    const updateJourneyState = async () => {
      if (socket) {
        try {
          socket.emit('update_journey_state', { 
            journeyState: 'IMAGE_GALLERY',
            additionalData: {
              phoneNumber,
              userId,
              email,
              name,
              gender,
              originalImageHash
            }
          });
          console.log('🖼️ Updated journey state to IMAGE_GALLERY', {
            phoneNumber, userId, email, name, gender, originalImageHash
          });
        } catch (error) {
          console.error('Failed to update journey state:', error);
        }
      }
    };

    updateJourneyState();

    // Start image generation process
    if (socket && originalImageHash) {
      console.log('🎨 Starting image generation process...');
      socket.emit('generate_image_gallery', {
        originalImageHash,
        phoneNumber,
        userId,
        email,
        name,
        gender
      });
    }

    // Listen for individual image completion
    const handleImageReady = (data: { imageIndex: number; imageHash: string }) => {
      console.log(`🖼️ Image ${data.imageIndex} ready:`, data.imageHash);
      
      setGalleryImages(prev => prev.map(img => 
        img.id === data.imageIndex 
          ? { ...img, imageHash: data.imageHash, isLoading: false, isReady: true }
          : img
      ));
    };

    // Listen for generation errors
    const handleGenerationError = (data: { imageIndex: number; error: string }) => {
      console.error(`❌ Image ${data.imageIndex} generation failed:`, data.error);
      
      setGalleryImages(prev => prev.map(img => 
        img.id === data.imageIndex 
          ? { ...img, isLoading: false, isReady: false }
          : img
      ));
    };

    // Listen for image selection confirmation
    const handleSelectionConfirmed = (data: { success: boolean; selectedImageHash: string }) => {
      console.log('🎉 Image selection confirmed:', data);
      setIsConfirming(false);
      
      if (data.success) {
        // TODO: Navigate to game lobby or dashboard
        // For now, just show success
        console.log('✅ Image selection successful, ready for next step');
        
        // Could navigate to lobby or game page here
        // push(<GameLobbyPage ... />);
      }
    };

    // Listen for selection errors
    const handleSelectionError = (data: { success: boolean; error: string }) => {
      console.error('❌ Image selection failed:', data.error);
      setIsConfirming(false);
    };

    if (socket) {
      socket.on('gallery_image_ready', handleImageReady);
      socket.on('gallery_image_error', handleGenerationError);
      socket.on('image_selection_confirmed', handleSelectionConfirmed);
      socket.on('image_selection_error', handleSelectionError);
    }

    return () => {
      if (socket) {
        socket.off('gallery_image_ready', handleImageReady);
        socket.off('gallery_image_error', handleGenerationError);
        socket.off('image_selection_confirmed', handleSelectionConfirmed);
        socket.off('image_selection_error', handleSelectionError);
      }
    };
  }, [socket, originalImageHash, phoneNumber, userId, email, name, gender]);

  const handleImageSelect = (imageId: number) => {
    const image = galleryImages[imageId];
    if (image && image.isReady) {
      setSelectedImageId(imageId);
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedImageId === null) return;
    
    const selectedImage = galleryImages[selectedImageId];
    if (!selectedImage || !selectedImage.imageHash) return;

    setIsConfirming(true);

    try {
      console.log('✅ Confirming image selection:', selectedImage.imageHash);
      
      // Emit final image selection to backend
      socket?.emit('confirm_image_selection', {
        selectedImageHash: selectedImage.imageHash,
        originalImageHash,
        userId,
        phoneNumber,
        email,
        name,
        gender
      });

      // Note: Response will be handled by the socket listener
      
    } catch (error) {
      console.error('Error confirming selection:', error);
      setIsConfirming(false);
    }
  };

  const renderImageSlot = (image: GalleryImage) => {
    const isSelected = selectedImageId === image.id;
    
    return (
      <div
        key={image.id}
        className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
          isSelected 
            ? 'ring-4 ring-orange-500 ring-offset-2 ring-offset-purple-900 scale-95 shadow-xl' 
            : 'hover:scale-105 shadow-lg'
        } ${
          image.isReady ? 'cursor-pointer' : 'cursor-default'
        }`}
        onClick={() => handleImageSelect(image.id)}
      >
        {image.isLoading ? (
          // Loading state - blurred original image with scanning effect
          <div className="relative w-full h-full">
            {/* Blurred background image */}
            <div 
              className="absolute inset-0 bg-center bg-cover"
              style={{
                backgroundImage: `url(${backendUrl}/uploads/${originalImageHash}.jpg)`,
                filter: 'blur(8px) brightness(0.3)',
              }}
            />
            
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50" />
            
            {/* Scanning effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="/videos/scanning-effect.gif" 
                alt="Scanning effect"
                className="w-16 h-16 opacity-80"
              />
            </div>
            
            {/* Loading indicator */}
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-black/60 rounded-lg px-2 py-1 text-center">
                <div className="text-xs text-white/80 font-medium">
                  מכין תמונה...
                </div>
                <div className="mt-1 bg-gray-600 rounded-full h-1">
                  <div className="bg-orange-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>
        ) : image.isReady && image.imageHash ? (
          // Ready state - show generated image
          <div className="relative w-full h-full">
            <img
              src={`${backendUrl}/uploads/${image.imageHash}.jpg`}
              alt={`Generated option ${image.id + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                <div className="bg-orange-500 rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Error state
          <div className="relative w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 text-2xl mb-2">⚠️</div>
              <div className="text-xs text-gray-400">שגיאה ביצירת תמונה</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleMenuAction = (action: string) => {
    // Handle menu actions if needed
    console.log('Menu action:', action);
  };

  return (
    <PageLayout 
      showHeader={true} 
      onMenuAction={handleMenuAction}
    >
      <main className="flex flex-col min-h-[calc(100vh-88px)] px-4 py-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            בחרו תמונה
          </h1>
          <p className="text-lg text-white/80">
            התמונות נוצרות בזמן אמת - בחרו את המועדפת עליכם
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 max-w-md mx-auto w-full">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {galleryImages.map(renderImageSlot)}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="pb-6">
          <button
            onClick={handleConfirmSelection}
            disabled={selectedImageId === null || isConfirming}
            className={`w-full max-w-md mx-auto block px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              selectedImageId !== null && !isConfirming
                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isConfirming ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                שומר בחירה...
              </div>
            ) : selectedImageId !== null ? (
              'אישור בחירה'
            ) : (
              'בחרו תמונה'
            )}
          </button>
        </div>

      </main>
    </PageLayout>
  );
}
