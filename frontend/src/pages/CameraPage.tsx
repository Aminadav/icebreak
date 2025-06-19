import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getIsTesting } from '../utils/isTesting';

// Declare global FaceDetection type for MediaPipe
declare global {
  interface Window {
    FaceDetection: any;
  }
  
  var FaceDetection: any;
}

interface CameraPageProps {
  onPictureCapture?: (imageBlob: Blob) => void;
  phoneNumber?: string;
  userId?: string;
  email?: string;
  name?: string;
  gender?: string;
  gameId?: string; // Add gameId for React Router support
}

export default function CameraPage({ 
  onPictureCapture, 
  phoneNumber, 
  userId, 
  email, 
  name, 
  gender,
  gameId 
}: CameraPageProps): JSX.Element {
  const isTesting=getIsTesting();
  const DEBUG=false
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { texts } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSmileText, setShowSmileText] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDetectionReady, setFaceDetectionReady] = useState(false);
  const [facePosition, setFacePosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  } | null>(null);
  const [croppedFaceImage, setCroppedFaceImage] = useState<string | null>(null);
  
  const faceDetectionRef = useRef<any | null>(null);
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Initialize face detection with fallback approach
    const initFaceDetection = async () => {
      // Skip face detection if in testing mode
      if (isTesting) {
        console.log('🧪 Testing mode: Skipping face detection initialization');
        setFaceDetectionReady(false);
        setFaceDetected(true); // Allow immediate capture
        setFacePosition(null);
        return;
      }

      try {
        console.log('👁️ Attempting to initialize face detection...');
        
        // Try using the browser's built-in face detection API first
        if ('FaceDetector' in window) {
          console.log('👁️ Using browser native FaceDetector API');
          try {
            const faceDetector = new (window as any).FaceDetector({
              maxDetectedFaces: 1,
              fastMode: true
            });
            
            // Create a simple face detection wrapper
            const detectFaces = async () => {
              if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
                try {
                  const faces = await faceDetector.detect(videoRef.current);
                  const hasFace = faces && faces.length > 0;
                  setFaceDetected(hasFace);
                  
                  if (hasFace) {
                    const face = faces[0];
                    const bbox = face.boundingBox;
                    
                    // Don't mirror for native API either - use original coordinates
                    const videoWidth = videoRef.current.videoWidth || 640;
                    const centerX = bbox.x + bbox.width / 2;
                    
                    setFacePosition({
                      x: Math.round(centerX),
                      y: Math.round(bbox.y + bbox.height / 2),
                      width: Math.round(bbox.width),
                      height: Math.round(bbox.height),
                      confidence: 0.8 // Native API doesn't provide confidence
                    });
                    
                    // Crop the face area for debugging - mirror X coordinate to match display
                    const mirroredCropX = videoWidth - centerX;
                    cropFaceFromVideo(
                      mirroredCropX - bbox.width/2, 
                      bbox.y, 
                      bbox.width, 
                      bbox.height
                    );
                    
                    // console.log('👁️ Face detected with native API!', {
                    //   center: { x: Math.round(centerX), y: Math.round(bbox.y + bbox.height / 2) },
                    //   size: { width: Math.round(bbox.width), height: Math.round(bbox.height) }
                    // });
                  } else {
                    setFacePosition(null);
                  }
                } catch (detectError) {
                  console.warn('Native face detection error:', detectError);
                }
              }
            };
            
            faceDetectionRef.current = { detect: detectFaces };
            setFaceDetectionReady(true);
            console.log('👁️ Native face detection initialized successfully');
            return;
          } catch (nativeError) {
            console.log('👁️ Native FaceDetector failed, trying MediaPipe...', nativeError);
          }
        }
        
        // Fallback to MediaPipe with better error handling
        console.log('👁️ Loading MediaPipe Face Detection...');
        
        // Load MediaPipe with specific working version
        if (!window.FaceDetection) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/face_detection.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
          
          // Wait a bit for the module to fully load
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('👁️ MediaPipe script loaded, creating FaceDetection instance...');
        
        const faceDetection = new window.FaceDetection({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`;
          }
        });

        console.log('👁️ Setting MediaPipe options...');
        faceDetection.setOptions({
          model: 'short',
          minDetectionConfidence: 0.2,
          selfieMode: true,
        });

        faceDetection.onResults((results: any) => {
          const hasFace = results.detections && results.detections.length > 0;
          setFaceDetected(hasFace);
          
          if (hasFace) {
            const detection = results.detections[0];
            const boundingBox = detection.boundingBox;
            
            const videoWidth = videoRef.current?.videoWidth || 640;
            const videoHeight = videoRef.current?.videoHeight || 480;
            
            const faceX = boundingBox.xCenter * videoWidth;
            const faceY = boundingBox.yCenter * videoHeight;
            const faceWidth = boundingBox.width * videoWidth;
            const faceHeight = boundingBox.height * videoHeight;
            
            // Don't mirror the X coordinate for MediaPipe - it already handles selfieMode correctly
            setFacePosition({
              x: Math.round(faceX),
              y: Math.round(faceY),
              width: Math.round(faceWidth),
              height: Math.round(faceHeight),
              confidence: detection.score?.[0] || 0.5
            });
            
            // Crop the face area for debugging - mirror X coordinate to match display
            const mirroredCropX = videoWidth - faceX;
            cropFaceFromVideo(
              mirroredCropX - faceWidth/2, 
              faceY - faceHeight/2, 
              faceWidth, 
              faceHeight
            );
            
            // console.log('👁️ MediaPipe face detected!', {
            //   confidence: detection.score?.[0],
            //   center: { x: Math.round(faceX), y: Math.round(faceY) },
            //   size: { width: Math.round(faceWidth), height: Math.round(faceHeight) }
            // });
          } else {
            setFacePosition(null);
          }
        });

        console.log('👁️ Initializing MediaPipe...');
        await faceDetection.initialize();
        
        faceDetectionRef.current = faceDetection;
        setFaceDetectionReady(true);
        console.log('👁️ MediaPipe face detection initialized successfully');
        
      } catch (error) {
        console.error('Face detection initialization failed:', error);
        console.log('👁️ Using fallback mode - allowing all captures');
        
        // Complete fallback - no face detection, allow all captures
        setFaceDetectionReady(false);
        setFaceDetected(true); // Allow capture without face detection
        setFacePosition(null);
      }
    };

    initFaceDetection();

    // Skip camera initialization in testing mode
    if (!isTesting) {
      startCamera();
    } else {
      console.log('🧪 Testing mode: Skipping camera initialization');
      setHasPermission(true);
      setIsLoading(false);
    }
    
    // Show smile text after a short delay
    const timer = setTimeout(() => {
      setShowSmileText(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      stopCamera();
      if (faceDetectionRef.current) {
        faceDetectionRef.current.close();
      }
      if (detectionIntervalRef.current) {
        window.clearInterval(detectionIntervalRef.current);
      }
    };
  }, [socket, phoneNumber, userId, email, name, gender]);

  // Start face detection when both are ready (skip if testing)
  useEffect(() => {
    if (!isTesting && faceDetectionReady && hasPermission && videoRef.current && !videoRef.current.paused) {
      startFaceDetection();
    }
  }, [faceDetectionReady, hasPermission]);

  // Fallback: If face detection fails to initialize after 5 seconds, allow capture anyway (skip if testing)
  useEffect(() => {
    if (!isTesting && hasPermission && !faceDetectionReady) {
      const fallbackTimer = setTimeout(() => {
        console.log('👁️ Face detection fallback: allowing capture without face detection');
        setFaceDetected(true); // Allow capture
      }, 5000); // 5 second timeout

      return () => clearTimeout(fallbackTimer);
    }
  }, [hasPermission, faceDetectionReady]);

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
          
          // Start face detection when video is ready
          if (faceDetectionReady && faceDetectionRef.current) {
            startFaceDetection();
          }
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
    
    // Stop face detection
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const startFaceDetection = () => {
    if (!faceDetectionRef.current || !videoRef.current) return;

    // Clear any existing interval
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
    }

    // Run face detection every 100ms instead of every frame for better performance
    detectionIntervalRef.current = window.setInterval(() => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended && faceDetectionRef.current) {
        try {
          // Check if this is native browser API or MediaPipe
          if (faceDetectionRef.current.detect) {
            // Native browser API
            faceDetectionRef.current.detect();
          } else if (faceDetectionRef.current.send) {
            // MediaPipe API
            faceDetectionRef.current.send({ image: videoRef.current });
          }
        } catch (error) {
          console.error('Face detection error:', error);
          // Stop detection on error
          if (detectionIntervalRef.current) {
            window.clearInterval(detectionIntervalRef.current);
          }
        }
      }
    }, 100); // 100ms = 10 FPS for face detection

    console.log('👁️ Face detection started (100ms interval)');
  };

  const cropFaceFromVideo = (x: number, y: number, width: number, height: number) => {
    if (!videoRef.current || !cropCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Add padding around the face (50% on each side for better visibility)
    const padding = 0.5;
    const paddedWidth = width * (1 + padding * 2);
    const paddedHeight = height * (1 + padding * 2);
    let paddedX = x - width * padding;
    let paddedY = y - height * padding;

    // Ensure we don't go outside video bounds and adjust if needed
    paddedX = Math.max(0, paddedX);
    paddedY = Math.max(0, paddedY);
    
    const maxWidth = Math.min(paddedWidth, video.videoWidth - paddedX);
    const maxHeight = Math.min(paddedHeight, video.videoHeight - paddedY);
    
    // If the crop area is too small, expand it by reducing constraints
    const actualWidth = Math.max(width, maxWidth);
    const actualHeight = Math.max(height, maxHeight);

    // Set canvas size to the cropped area
    canvas.width = actualWidth;
    canvas.height = actualHeight;

    // console.log('🖼️ Cropping face:', {
    //   original: { x, y, width, height },
    //   padded: { x: paddedX, y: paddedY, width: actualWidth, height: actualHeight },
    //   video: { width: video.videoWidth, height: video.videoHeight }
    // });

    // Draw the cropped face area as it actually appears (no mirroring)
    // This shows the actual image that will be uploaded
    ctx.drawImage(
      video,
      paddedX, paddedY, actualWidth, actualHeight, // Source coordinates
      0, 0, actualWidth, actualHeight               // Destination coordinates
    );

    // Convert to data URL for preview
    const croppedImageData = canvas.toDataURL('image/jpeg', 0.9);
    setCroppedFaceImage(croppedImageData);
  };

  const uploadImage = async (imageBlob: Blob) => {
    if (!socket) return null;

    try {
      setIsUploading(true);
      setUploadError(null);

      console.log('📤 Starting cropped face image upload...');

      // Convert blob to base64 for socket transmission
      const reader = new FileReader();
      
      return new Promise<string | null>((resolve) => {
        reader.onload = () => {
          const base64Data = reader.result as string;
          const base64WithoutPrefix = base64Data.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          console.log('!!!!')
          console.log('📤 Emitting image upload...');
          socket.emit('upload_pending_image', {
            imageData: base64WithoutPrefix,
            phoneNumber,
            userId,
            email,
            name,
            gender
          });

          // Listen for upload response
          const handleUploadResponse = (response: any) => {
            console.log('📤 Upload response:', response);
            setIsUploading(false);
            
            if (response.success) {
              console.log('📤 Image uploaded successfully:', response.imageHash);
              socket.off('upload_pending_image_response', handleUploadResponse);
              socket.off('error', handleUploadError);
              resolve(response.imageHash);
            } else {
              console.error('📤 Upload failed:', response.error);
              setUploadError('שגיאה בהעלאת התמונה');
              socket.off('upload_pending_image_response', handleUploadResponse);
              socket.off('error', handleUploadError);
              resolve(null);
            }
          };

          const handleUploadError = (error: any) => {
            console.error('📤 Upload error:', error);
            setUploadError('שגיאה בהעלאת התמונה');
            setIsUploading(false);
            socket.off('upload_pending_image_response', handleUploadResponse);
            socket.off('error', handleUploadError);
            resolve(null);
          };

          socket.once('upload_pending_image_response', handleUploadResponse);
          socket.once('error', handleUploadError);
        };

        reader.onerror = (error) => {
          console.error('📤 Error reading image file:', error);
          setUploadError('שגיאה בקריאת התמונה');
          setIsUploading(false);
          resolve(null);
        };

        reader.readAsDataURL(imageBlob);
      });

    } catch (error) {
      console.error('📤 Error in uploadImage:', error);
      setUploadError('שגיאה בהעלאת התמונה');
      setIsUploading(false);
      return null;
    }
  };

  const capturePhoto = async () => {
    if (isCapturing) return;

    try {
      setIsCapturing(true);

      // In testing mode, create a mock image instead of using the camera
      if (isTesting) {
        console.log('📸 Testing mode: Creating mock image');
        
        // Create a mock canvas with a simple test image
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw a simple mock face image
          ctx.fillStyle = '#f4c2a1'; // Skin color background
          ctx.fillRect(0, 0, 640, 480);
          
          // Draw a simple face
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(200, 200, 20, 0, 2 * Math.PI); // Left eye
          ctx.arc(440, 200, 20, 0, 2 * Math.PI); // Right eye
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(320, 300, 50, 0, Math.PI); // Mouth
          ctx.stroke();
          
          // Add text to indicate it's a test image
          ctx.fillStyle = '#333';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('TEST IMAGE', 320, 400);
        }
        
        // Convert to blob and proceed
        return new Promise<void>((resolve) => {
          canvas.toBlob(async (blob) => {
            if (blob) {
              // Call the onPictureCapture callback if provided
              if (onPictureCapture) {
                onPictureCapture(blob);
              }
              
              // Upload image and navigate directly to gallery
              if (phoneNumber && userId && email && name && gender) {
                console.log('📤 Uploading mock test image and navigating to gallery...');
                
                const imageHash = await uploadImage(blob);
                
                if (imageHash) {
                  navigate(`/game/${gameId}/gallery`);
                } else {
                  console.error('Failed to upload image');
                  setUploadError('שגיאה בהעלאת התמונה');
                }
              }
            }
            
            // Add a small delay for visual feedback
            setTimeout(() => {
              setIsCapturing(false);
              resolve();
            }, 300);
          }, 'image/jpeg', 0.8);
        });
      }

      // For non-testing mode, we need the video and canvas elements
      if (!videoRef.current || !canvasRef.current) {
        setIsCapturing(false);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsCapturing(false);
        return;
      }

      // When no face detection, capture the full video frame
      if (!facePosition) {
        console.log('📸 Capturing full frame (no face detected)');
        
        // Set canvas dimensions to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the full video frame (mirrored to match display)
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.scale(-1, 1); // Reset scale

        // Convert to blob and proceed
        return new Promise<void>((resolve) => {
          canvas.toBlob(async (blob) => {
            if (blob) {
              // Call the onPictureCapture callback if provided
              if (onPictureCapture) {
                onPictureCapture(blob);
              }
              
              // Upload image and navigate directly to gallery
              if (phoneNumber && userId && email && name && gender) {
                console.log('📤 Uploading full frame image and navigating to gallery...');
                
                const imageHash = await uploadImage(blob);
                
                if (imageHash) {
                  navigate(`/game/${gameId}/gallery`);
                } else {
                  console.error('Failed to upload image');
                  setUploadError('שגיאה בהעלאת התמונה');
                }
              }
            }
            
            // Add a small delay for visual feedback
            setTimeout(() => {
              setIsCapturing(false);
              resolve();
            }, 300);
          }, 'image/jpeg', 0.8);
        });
      }

      // Check if we have face position for cropping (non-testing mode)
      if (!facePosition) {
        console.error('No face detected for cropping');
        setIsCapturing(false);
        return;
      }

      // Use the crop canvas that already has the cropped face
      // First, update the crop canvas with the current face position
      const { x, y, width, height } = facePosition;
      
      // Mirror X coordinate to match display (since video is mirrored)
      const videoWidth = video.videoWidth || 640;
      const mirroredCropX = videoWidth - x;
      
      // Update the cropped face one more time to ensure we have the latest frame
      cropFaceFromVideo(
        mirroredCropX - width/2, 
        y - height/2, 
        width, 
        height
      );

      // Convert the cropped canvas to blob
      return new Promise<void>((resolve) => {
        cropCanvasRef.current!.toBlob(async (blob) => {
          if (blob) {
            // Call the onPictureCapture callback if provided
            if (onPictureCapture) {
              onPictureCapture(blob);
            }
            
            // Upload image and navigate directly to gallery
              console.log('📤 Uploading cropped face image and navigating to gallery...');
              
              const imageHash = await uploadImage(blob);
              
              if (imageHash) {
                navigate(`/game/${gameId}/gallery`);
              } else {
                console.error('Failed to upload image');
                setUploadError('שגיאה בהעלאת התמונה');
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
    navigate(-1);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black" dir="ltr">
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

      {/* Face Detection Canvas (invisible overlay) */}
      <canvas
        ref={detectionCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ 
          transform: 'scaleX(-1)', // Mirror to match video
          display: hasPermission ? 'block' : 'none',
          opacity: 0 // Make invisible, we only want the detection logic
        }}
      />

      {/* Face Positioning Guide Circle */}
      {hasPermission && !error && !isTesting && (
        <div className="absolute inset-0 pointer-events-none z-5">
          <div className="flex items-center justify-center w-full h-full">
            <div 
              className={`w-72 h-72 rounded-full border-4 border-dashed transition-colors duration-300 ${
                faceDetected 
                  ? 'border-green-400 animate-pulse' 
                  : 'border-white/60'
              }`}
              style={{
                borderSpacing: '10px',
              }}
            >
              {/* Inner guide for better positioning */}
              <div className="flex items-center justify-center w-full h-full">
                <div 
                  className={`w-48 h-64 rounded-full border-2 border-dashed transition-colors duration-300 ${
                    faceDetected 
                      ? 'border-green-400/50' 
                      : 'border-white/30'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Face Detection Debug Overlay */}
      {DEBUG && hasPermission && !error && facePosition && !isTesting && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Face position info and cropped face image */}
          <div className="absolute max-w-xs p-2 text-sm text-white rounded top-4 left-4 bg-black/70">
            <div>Face: {facePosition.x}, {facePosition.y}</div>
            <div>Size: {facePosition.width} × {facePosition.height}</div>
            <div>Confidence: {(facePosition.confidence * 100).toFixed(1)}%</div>
            <div className="mt-1 text-xs text-gray-300">
              Move left → X should decrease<br/>
              Move right → X should increase
            </div>
            
            {/* Cropped face preview */}
            {croppedFaceImage && (
              <div className="mt-2">
                <div className="mb-1 text-xs text-gray-300">Cropped Face:</div>
                <img 
                  src={croppedFaceImage} 
                  alt="Cropped face" 
                  className="border border-gray-400 rounded max-w-24 max-h-24"
                  style={{
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden canvas for face cropping */}
      <canvas ref={cropCanvasRef} className="hidden" />

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
            {texts.pictureUpload.cameraSmileText}
          </p>
        </div>
      )}

      {/* Capture Button */}
      {hasPermission && !error && (
        <div className="absolute z-10 text-center transform -translate-x-1/2 bottom-8 left-1/2">
          <button
            onClick={capturePhoto}
            disabled={isCapturing || isUploading || (!isTesting && !faceDetected)}
            data-testid="camera-capture-button"
            className={`w-20 h-20 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
              isCapturing || isUploading
                ? 'bg-orange-500 animate-pulse' 
                : (isTesting || faceDetected)
                ? 'bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl'
                : 'bg-gray-500 cursor-not-allowed'
            }`}
          >
            {isCapturing || isUploading ? (
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full border-4 border-white rounded-full">
                <div className="w-12 h-12 bg-white rounded-full"></div>
              </div>
            )}
          </button>
          
          {/* Status text below button */}
          {isUploading && (
            <div className="mt-3 text-center">
              <p className="text-sm text-orange-300 animate-pulse">
                מעלה תמונה...
              </p>
            </div>
          )}
          
          {uploadError && (
            <div className="mt-3 text-center">
              <p className="text-sm text-red-400">
                {uploadError}
              </p>
            </div>
          )}
          
          {/* Instruction text below button */}
          {!isTesting && !faceDetected && !isUploading && !uploadError && (
            <div className="mt-3 text-center">
              <p className="text-sm text-white/80">
                מקמו את הפנים במעגל כדי לצלם את התמונה
              </p>
            </div>
          )}
          
          {isTesting && (
            <div className="mt-3 text-center">
              <p className="text-sm text-yellow-300">
                🧪 Testing Mode - Click to capture
              </p>
            </div>
          )}
          
        </div>
      )}

      {/* Capture Flash Effect */}
      {isCapturing && (
        <div className="absolute inset-0 z-20 bg-white opacity-50 pointer-events-none animate-flash" />
      )}
    </div>
  );
}
