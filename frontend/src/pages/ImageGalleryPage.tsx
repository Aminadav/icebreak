import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import ProcessingModal from '../components/ProcessingModal';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { useSocket } from '../contexts/SocketContext';

import { useGameId } from '../utils/useGameId';
import { env } from '../env';

interface ImageGalleryPageProps {
  originalImageHash: string;
  phoneNumber: string;
  userId: string;
  email: string;
  name: string;
  gender: string;
  capturedImageUrl?: string; // Optional for the modal
  gameId?: string; // Add gameId for React Router support
}

interface GalleryImage {
  id: number;
  imageHash?: string;
  isLoading: boolean;
  isReady: boolean;
  progress: number; // Progress percentage 0-100
  startTime?: number; // When generation started
}

export default function ImageGalleryPage(): JSX.Element {
  const { socket } = useSocket();
  
  const navigate = useNavigate();

  // Get backend URL from environment
  const backendUrl = env.BACKEND_URL
  
  // State for gallery images (dynamic count based on backend)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  
  // Initialize gallery images when count is known
  const initializeGalleryImages = (count: number) => {
    setGalleryImages(Array.from({ length: count }, (_, index) => ({
      id: index,
      isLoading: true,
      isReady: false,
      progress: 0
    })));
  };
  
  const [showProcessingModal, setShowProcessingModal] = useState(true);
  const [generationStarted, setGenerationStarted] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageHash, setPreviewImageHash] = useState<string | null>(null);

  // Handle Enter key press for gallery navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        
        if (showImagePreview) {
          // If preview is open, choose the current image
          handleChooseImage();
        } else {
          // If gallery is visible, open the first ready image
          const firstReadyImage = galleryImages.find(img => img.isReady && img.imageHash);
          if (firstReadyImage) {
            handleImageSelect(firstReadyImage.id);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [showImagePreview, galleryImages]);

  // Start image generation function
  const startImageGeneration = () => {
      console.log('🎨 Starting image generation process...');
      setGenerationStarted(true);

      socket!.emit('generate_image_gallery');
  };

  var [originalImageHash,set_originalImageHash] = useState(''); 

  useEffect(()=>{
    socket!.emit('get_original_image_hash', (data: { originalImageHash: string }) => {
      console.log('📥 Received original image hash:', data.originalImageHash);
      set_originalImageHash(data.originalImageHash);
    })
  },[])

  useEffect(() => {


    // Initialize with default number of images (will be updated by backend)
    if (galleryImages.length === 0) {
      initializeGalleryImages(6); // Default fallback
    }

    // Load existing images first
      socket!.emit('load_existing_gallery_images');

    // Start image generation IMMEDIATELY when component mounts
    startImageGeneration();
  }, [socket]);

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
        const progress = Math.min((elapsed / 30000) * 100, 99); // 30 seconds = 100%
        
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

    // Listen for generation started event (with image count)
    const handleGenerationStarted = (data: { imageCount: number; userId: string }) => {
      console.log(`🎬 Generation started with ${data.imageCount} images for user ${data.userId}`);
      initializeGalleryImages(data.imageCount);
      
      // Mark all images as started and record start times
      const now = Date.now();
      setGalleryImages(prev => prev.map(img => ({
        ...img,
        startTime: now + (img.id * 1000) // Stagger start times by 1 second
      })));
    };

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
      socket.on('gallery_generation_started', handleGenerationStarted);
      socket.on('gallery_image_ready', handleImageReady);
      socket.on('gallery_image_error', handleGenerationError);
      socket.on('image_selection_confirmed', handleSelectionConfirmed);
      socket.on('image_selection_error', handleSelectionError);
      socket.on('existing_images_loaded', handleExistingImagesLoaded);
      socket.on('existing_images_error', handleExistingImagesError);
    }

    return () => {
      if (socket) {
        socket.off('gallery_generation_started', handleGenerationStarted);
        socket.off('gallery_image_ready', handleImageReady);
        socket.off('gallery_image_error', handleGenerationError);
        socket.off('image_selection_confirmed', handleSelectionConfirmed);
        socket.off('image_selection_error', handleSelectionError);
        socket.off('existing_images_loaded', handleExistingImagesLoaded);
        socket.off('existing_images_error', handleExistingImagesError);
      }
    };
  }, [socket]);

  const handleImageSelect = (imageId: number) => {
    const image = galleryImages[imageId];
    if (image && image.isReady && image.imageHash) {
      console.log('🖼️ Opening image preview for:', image.imageHash);
      setPreviewImageHash(image.imageHash);
      setShowImagePreview(true);
    }
  };

  // Image preview modal handlers
  const handleClosePreview = () => {
    setShowImagePreview(false);
    setPreviewImageHash(null);
  };

  var gameId=useGameId()

  const handleChooseImage = () => {
    if (!previewImageHash) return;
    
    console.log('✅ User chose image from preview:', previewImageHash);
    
    // Find the image index for the selected hash
    const imageIndex = galleryImages.findIndex(img => img.imageHash === previewImageHash);
    if (imageIndex !== -1) {
      setShowImagePreview(false);
      setPreviewImageHash(null);
      
      // Navigate directly to the Creator Game Ready page
      const selectedImage = galleryImages[imageIndex];
      if (selectedImage && selectedImage.imageHash) {
        // Emit confirmation in background
        socket?.emit('confirm_image_selection', {
          selectedImageHash: selectedImage.imageHash,
          gameId
        });
        
        // Navigate to game ready page immediately
      }
    }
  };

  const renderImageSlot = (image: GalleryImage) => {
    return (
      <div
        key={image.id}
        className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg ${
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

  return (
    <>
      {/* Processing Modal */}
      <ProcessingModal 
        isVisible={showProcessingModal}
        imageUrl={ `${backendUrl}/uploads/${originalImageHash}.jpg`}
        onComplete={handleProcessingComplete}
      />

      <PageLayout 
        showHeader={true} 
        
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

      </main>
    </PageLayout>

    {/* Image Preview Modal */}
    {showImagePreview && previewImageHash && (
      <ImagePreviewModal
        imageHash={previewImageHash}
        isVisible={showImagePreview}
        onClose={handleClosePreview}
        onChoose={handleChooseImage}
      />
    )}
    </>
  );
}
