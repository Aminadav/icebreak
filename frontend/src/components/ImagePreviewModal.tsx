import { useEffect, useCallback } from 'react';
import Button from './Button';

interface ImagePreviewModalProps {
  imageHash: string;
  isVisible: boolean;
  onClose: () => void;
  onChoose: () => void;
}

// SVG Icons
const ChooseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.542"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

export default function ImagePreviewModal({ 
  imageHash, 
  isVisible, 
  onClose, 
  onChoose 
}: ImagePreviewModalProps): JSX.Element {
  
  // Get backend URL from environment
  const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001';
  
  // URL for watermarked image
  const watermarkedImageUrl = `${backendUrl}/api/watermark/${imageHash}`;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onClose]);

  const handleDownload = useCallback(() => {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = watermarkedImageUrl;
    link.download = `icebreak-image-${imageHash}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('📥 Image download initiated');
  }, [watermarkedImageUrl, imageHash]);

  const handleShare = useCallback(async () => {
    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        // Fetch the image and convert to blob for sharing
        const response = await fetch(watermarkedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], `icebreak-image-${imageHash}.jpg`, { type: 'image/jpeg' });
        
        await navigator.share({
          title: 'IceBreak - משחק לגיבוש קבוצות WhatsApp',
          text: 'היי! מוזמנים לשחק במשחק IceBreak בוואטסאפ!',
          files: [file]
        });
        
        console.log('📤 Image shared successfully');
      } catch (error) {
        console.error('❌ Error sharing image:', error);
        // Fallback to copying URL to clipboard
        handleCopyLink();
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyLink();
    }
  }, [watermarkedImageUrl, imageHash]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(watermarkedImageUrl);
      console.log('📋 Image URL copied to clipboard');
      // You could show a toast notification here
    } catch (error) {
      console.error('❌ Error copying to clipboard:', error);
    }
  }, [watermarkedImageUrl]);

  if (!isVisible) return <></>;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black bg-opacity-95 flex items-center justify-center transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-4 h-4 bg-yellow-400 rounded-full top-10 left-10 animate-pulse opacity-70 animation-delay-0"></div>
        <div className="absolute w-3 h-3 bg-blue-400 rounded-full top-32 right-20 animate-bounce opacity-60 animation-delay-100"></div>
        <div className="absolute w-5 h-5 bg-pink-400 rounded-full opacity-50 bottom-20 left-32 animate-ping animation-delay-200"></div>
        <div className="absolute w-2 h-2 bg-green-400 rounded-full bottom-40 right-16 animate-pulse opacity-80 animation-delay-300"></div>
        <div className="absolute w-3 h-3 bg-purple-400 rounded-full top-1/3 left-1/4 animate-bounce opacity-60 animation-delay-400"></div>
        <div className="absolute w-4 h-4 bg-orange-400 rounded-full opacity-50 top-2/3 right-1/3 animate-ping animation-delay-500"></div>
        <div className="absolute w-3 h-3 rounded-full top-1/2 left-1/2 bg-cyan-400 animate-pulse opacity-70 animation-delay-600"></div>
        <div className="absolute w-2 h-2 bg-red-400 rounded-full top-20 right-1/4 animate-bounce opacity-60 animation-delay-700"></div>
      </div>

      {/* Modal Content */}
      <div 
        className="relative max-w-4xl max-h-[90vh] mx-4 bg-gradient-to-br from-purple-900 to-pink-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-400 animate-in zoom-in-50 duration-500"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 0 50px rgba(168, 85, 247, 0.5), 0 0 100px rgba(236, 72, 153, 0.3)'
        }}
      >
        {/* Header with fun title */}
        <div className="relative p-4 bg-gradient-to-r from-yellow-400 to-purple-600">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              🎨 ✨ תמונה מדהימה! ✨ 🎮
            </h2>
            <p className="mt-1 text-sm text-white/90">
              איך התמונה הזאת נראית לך?
            </p>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute flex items-center justify-center w-8 h-8 text-white transition-all duration-200 rounded-full top-4 right-4 bg-white/20 hover:bg-white/30 hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Container */}
        <div className="relative px-1">
          <div className="relative max-w-2xl mx-auto">
            {/* Glowing border effect */}
            <div className="absolute opacity-75 -inset-1 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-2xl blur animate-pulse"></div>
            
            {/* Image */}
            <div className="relative overflow-hidden bg-black rounded-2xl">
              <img
                src={watermarkedImageUrl}
                alt="תמונה עם חותמת מים"
                className="w-full h-auto max-h-[70vh] object-contain transition-all duration-300 hover:scale-105 aspect-square"
              />
              
              {/* Sparkle overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-30"></div>
              
              {/* Corner sparkles */}
              <div className="absolute text-xl text-yellow-300 top-4 right-4 animate-bounce">✨</div>
              <div className="absolute text-lg text-pink-300 bottom-4 left-4 animate-ping">💫</div>
              <div className="absolute text-sm text-blue-300 top-4 left-4 animate-pulse">⭐</div>
              <div className="absolute text-xl text-purple-300 bottom-4 right-4 animate-bounce animation-delay-300">🌟</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 bg-gradient-to-r from-purple-900 to-pink-900 bg-opacity-80">
          <div className="">
            {/* Choose Button - Primary action */}
            <Button
              variant="primary"
              onClick={onChoose}
              icon={<ChooseIcon />}
              className="px-6 py-4"
              data-testid='choose-image-button'
            >
              בחר תמונה זו!
            </Button>

              {/* Download Button */}
              <Button
                variant="secondary-small"
                onClick={handleDownload}
                icon={<DownloadIcon />}
                className="px-6 py-4"
              >
                הורד
              </Button>

              {/* Share Button */}
              <Button
                variant="secondary-small"
                onClick={handleShare}
                icon={<WhatsAppIcon />}
                className="px-6 py-4"
              >
                שתף
              </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              onClick={onClose}
              icon={<CloseIcon />}
              className="px-4 py-2 !no-underline"
            >
              סגור
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
