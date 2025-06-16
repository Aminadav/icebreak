import { useEffect, useCallback } from 'react';

interface ImagePreviewModalProps {
  imageHash: string;
  isVisible: boolean;
  onClose: () => void;
  onChoose: () => void;
}

export default function ImagePreviewModal({ 
  imageHash, 
  isVisible, 
  onClose, 
  onChoose 
}: ImagePreviewModalProps): JSX.Element {
  
  // Get backend URL from environment
  const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';
  
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
          title: 'IceBreak AI Image',
          text: 'Check out my AI-generated image from IceBreak!',
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
        <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-pulse opacity-70 animation-delay-0"></div>
        <div className="absolute top-32 right-20 w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-60 animation-delay-100"></div>
        <div className="absolute bottom-20 left-32 w-5 h-5 bg-pink-400 rounded-full animate-ping opacity-50 animation-delay-200"></div>
        <div className="absolute bottom-40 right-16 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-80 animation-delay-300"></div>
        <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-60 animation-delay-400"></div>
        <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-orange-400 rounded-full animate-ping opacity-50 animation-delay-500"></div>
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-70 animation-delay-600"></div>
        <div className="absolute top-20 right-1/4 w-2 h-2 bg-red-400 rounded-full animate-bounce opacity-60 animation-delay-700"></div>
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
        <div className="relative bg-gradient-to-r from-yellow-400 to-purple-600 p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              🎨 ✨ תמונה מדהימה! ✨ 🎮
            </h2>
            <p className="text-white/90 text-sm mt-1">
              איך התמונה הזאת נראית לך?
            </p>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Container */}
        <div className="relative p-6">
          <div className="relative mx-auto max-w-2xl">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-2xl blur opacity-75 animate-pulse"></div>
            
            {/* Image */}
            <div className="relative bg-black rounded-2xl overflow-hidden animate-pulse">
              <img
                src={watermarkedImageUrl}
                alt="תמונה עם חותמת מים"
                className="w-full h-auto max-h-[50vh] object-contain transition-all duration-300 hover:scale-105"
              />
              
              {/* Sparkle overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-30"></div>
              
              {/* Corner sparkles */}
              <div className="absolute top-4 right-4 text-yellow-300 text-xl animate-bounce">✨</div>
              <div className="absolute bottom-4 left-4 text-pink-300 text-lg animate-ping">💫</div>
              <div className="absolute top-4 left-4 text-blue-300 text-sm animate-pulse">⭐</div>
              <div className="absolute bottom-4 right-4 text-purple-300 text-xl animate-bounce animation-delay-300">🌟</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gradient-to-r from-purple-900 to-pink-900 bg-opacity-80">
          <div className="grid grid-cols-2 gap-4">
            {/* Choose Button - Primary action */}
            <button
              onClick={onChoose}
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg border-2 border-green-400 hover:animate-pulse"
            >
              <div className="relative flex items-center justify-center gap-3">
                <span className="text-2xl animate-bounce">🎯</span>
                <span className="text-lg">בחר תמונה זו!</span>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg border-2 border-blue-400"
            >
              <div className="relative flex items-center justify-center gap-3">
                <span className="text-2xl group-hover:animate-bounce">⬇️</span>
                <span className="text-lg">הורד</span>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="group relative overflow-hidden bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg border-2 border-pink-400"
            >
              <div className="relative flex items-center justify-center gap-3">
                <span className="text-2xl group-hover:animate-ping">📤</span>
                <span className="text-lg">שתף</span>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg border-2 border-gray-500"
            >
              <div className="relative flex items-center justify-center gap-3">
                <span className="text-2xl group-hover:animate-spin">✖️</span>
                <span className="text-lg">סגור</span>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>

          {/* Fun footer message */}
          <div className="text-center mt-6">
            <p className="text-white/80 text-sm flex items-center justify-center gap-2">
              <span className="animate-bounce animation-delay-0">🌟</span>
              <span>תמונה זו נוצרה בעזרת בינה מלאכותית</span>
              <span className="animate-bounce animation-delay-200">🤖</span>
              <span className="animate-bounce animation-delay-400">✨</span>
            </p>
            <p className="text-white/60 text-xs mt-2 animate-pulse">
              לחץ על כפתור הפעולה הרצויה למעלה
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
