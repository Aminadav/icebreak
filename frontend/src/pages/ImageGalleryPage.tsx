import { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/PageLayout';
import ProcessingModal from '../components/ProcessingModal';
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
  capturedImageUrl?: string; // Optional for the modal
}

interface GalleryImage {
  id: number;
  imageHash?: string;
  isLoading: boolean;
  isReady: boolean;
  progress: number; // Progress percentage 0-100
  startTime?: number; // When generation started
}

export default function ImageGalleryPage({ 
  originalImageHash,
  phoneNumber, 
  userId, 
  email, 
  name, 
  gender,
  capturedImageUrl 
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
      isReady: false,
      progress: 0
    }))
  );
  
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(true);
  const [generationStarted, setGenerationStarted] = useState(false);

  // Start image generation function
  const startImageGeneration = () => {
    if (socket && originalImageHash && !generationStarted) {
      console.log('🎨 Starting image generation process...');
      setGenerationStarted(true);
      
      // Mark all images as started and record start times
      const now = Date.now();
      setGalleryImages(prev => prev.map(img => ({
        ...img,
        startTime: now + (img.id * 1000) // Stagger start times by 1 second
      })));

      socket.emit('generate_image_gallery', {
        originalImageHash,
        phoneNumber,
        userId,
        email,
        name
      });
    }
  };

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

    // Load existing images first
    if (socket && originalImageHash && userId) {
      console.log('🔍 Loading existing gallery images...');
      socket.emit('load_existing_gallery_images', {
        originalImageHash,
        userId
      });
    }

    // Start image generation IMMEDIATELY when component mounts
    startImageGeneration();
  }, [socket, originalImageHash, phoneNumber, userId, email, name, gender]);

  // Handle processing modal completion
  const handleProcessingComplete = useCallback(() => {
    console.log('🎬 Processing modal completed, hiding modal');
    setShowProcessingModal(false);
    // Generation already started, just hide modal
  }, []);

  // Progress bar animation for each image (15 seconds each)
  useEffect(() => {
    if (!generationStarted) return;

    const interval = setInterval(() => {
      setGalleryImages(prev => prev.map(img => {
        if (!img.startTime || img.isReady) return img;
        
        const elapsed = Date.now() - img.startTime;
        const progress = Math.min((elapsed / 25000) * 100, 99); // 15 seconds = 100%
        
        return {
          ...img,
          progress: Math.max(0, progress)
        };
      }));
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [generationStarted]);

  useEffect(() => {
    if (!socket) return;

    // Listen for individual image completion
    const handleImageReady = (data: { imageIndex: number; imageHash: string }) => {
      console.log(`🖼️ Image ${data.imageIndex} ready:`, data.imageHash);
      
      setGalleryImages(prev => prev.map(img => 
        img.id === data.imageIndex 
          ? { ...img, imageHash: data.imageHash, isLoading: false, isReady: true, progress: 100 }
          : img
      ));
    };

    // Listen for generation errors
    const handleGenerationError = (data: { imageIndex: number; error: string }) => {
      console.error(`❌ Image ${data.imageIndex} generation failed:`, data.error);
      
      setGalleryImages(prev => prev.map(img => 
        img.id === data.imageIndex 
          ? { ...img, isLoading: false, isReady: false, progress: 0 }
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

    // Listen for existing images loaded
    const handleExistingImagesLoaded = (data: { success: boolean; imageCount: number }) => {
      console.log('📂 Existing images loaded:', data);
      if (data.imageCount > 0) {
        // If we have existing images, hide the modal immediately
        console.log('🎬 Found existing images, hiding processing modal');
        setShowProcessingModal(false);
      }
    };

    // Listen for existing images errors
    const handleExistingImagesError = (data: { success: boolean; error: string }) => {
      console.error('❌ Failed to load existing images:', data.error);
      // Continue with normal flow even if loading existing images fails
    };

    if (socket) {
      socket.on('gallery_image_ready', handleImageReady);
      socket.on('gallery_image_error', handleGenerationError);
      socket.on('image_selection_confirmed', handleSelectionConfirmed);
      socket.on('image_selection_error', handleSelectionError);
      socket.on('existing_images_loaded', handleExistingImagesLoaded);
      socket.on('existing_images_error', handleExistingImagesError);
    }

    return () => {
      if (socket) {
        socket.off('gallery_image_ready', handleImageReady);
        socket.off('gallery_image_error', handleGenerationError);
        socket.off('image_selection_confirmed', handleSelectionConfirmed);
        socket.off('image_selection_error', handleSelectionError);
        socket.off('existing_images_loaded', handleExistingImagesLoaded);
        socket.off('existing_images_error', handleExistingImagesError);
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
        name
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
            
            {/* Loading indicator with real progress */}
            <div className="absolute bottom-2 left-2 right-2">
              <div className="px-2 py-1 text-center rounded-lg bg-black/60">
                <div className="text-xs font-medium text-white/80">
                  מכין תמונה...
                </div>
                <div className="h-1 mt-1 bg-gray-600 rounded-full">
                  <div 
                    className="h-1 transition-all duration-300 ease-out bg-orange-500 rounded-full" 
                    style={{ width: `${Math.max(5, image.progress)}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-white/60">
                  {Math.round(image.progress)}%
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
              className="object-cover w-full h-full"
            />
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center bg-orange-500/20">
                <div className="p-2 bg-orange-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Error state
          <div className="relative flex items-center justify-center w-full h-full bg-gray-800">
            <div className="text-center">
              <div className="mb-2 text-2xl text-red-400">⚠️</div>
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
    <>
      {/* Processing Modal */}
      <ProcessingModal 
        isVisible={showProcessingModal}
        imageUrl={capturedImageUrl || `${backendUrl}/uploads/${originalImageHash}.jpg`}
        onComplete={handleProcessingComplete}
      />

      <PageLayout 
        showHeader={true} 
        onMenuAction={handleMenuAction}
      >
      <main className="flex flex-col min-h-[calc(100vh-88px)] px-4 py-6">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-white">
            בחרו תמונה
          </h1>
          <p className="text-lg text-white/80">
            התמונות נוצרות בזמן אמת - בחרו את המועדפת עליכם
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 w-full max-w-md mx-auto">
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
    </>
  );
}
