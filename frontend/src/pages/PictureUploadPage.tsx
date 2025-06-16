import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import AnimatedImage from '../components/AnimatedImage';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSocket } from '../contexts/SocketContext';
import AboutPage from '../components/AboutPage';
import ComponentsShowcase from './ComponentsShowcase';
import CameraPage from './CameraPage';

interface PictureUploadPageProps {
  phoneNumber?: string;
  userId?: string;
  email?: string;
  name?: string;
  gender?: string;
}

export default function PictureUploadPage({ phoneNumber, userId, email, name, gender }: PictureUploadPageProps): JSX.Element {
  const { texts } = useLanguage();
  const { back, push } = useNavigation();
  const { socket } = useSocket();
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'gallery' | null>(null);

  // Update journey state when component mounts
  useEffect(() => {
    const updateJourneyState = async () => {
      if (socket) {
        try {
          // Store all user data with journey state for proper page reload handling
          socket.emit('update_journey_state', { 
            journeyState: 'PICTURE_UPLOAD',
            additionalData: {
              phoneNumber,
              userId,
              email,
              name,
              gender
            }
          });
          console.log('🎯 Updated journey state to PICTURE_UPLOAD with user data', {
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
    } else {
      console.warn('⚠️ Missing user data for journey state update', {
        phoneNumber, userId, email, name, gender
      });
    }
  }, [socket, phoneNumber, userId, email, name, gender]);

  const handleMenuAction = (page: string) => {
    if (page === 'about') {
      push(<AboutPage />);
    } else if (page === 'components') {
      push(<ComponentsShowcase />);
    }
  };

  const handleCameraUpload = () => {
    setUploadMethod('camera');
    setIsLoading(true);
    
    console.log('📸 Camera upload selected - navigating to camera page');
    
    // Navigate to camera page
    push(<CameraPage 
      phoneNumber={phoneNumber}
      userId={userId}
      email={email}
      name={name}
      gender={gender}
      onPictureCapture={(imageBlob: Blob) => {
        console.log('📸 Picture captured:', imageBlob);
        // TODO: Handle the captured image (upload to server, etc.)
        
        // Update journey state back to picture upload
        if (socket) {
          socket.emit('update_journey_state', { 
            journeyState: 'PICTURE_UPLOAD',
            additionalData: {
              phoneNumber,
              userId,
              email,
              name,
              gender
            }
          });
        }
        
        // For now, just go back to picture upload page
        back();
      }}
    />);
    
    // Reset loading state
    setIsLoading(false);
    setUploadMethod(null);
  };

  const handleGalleryUpload = () => {
  setUploadMethod('gallery');
    setIsLoading(true);
    
    // TODO: Implement gallery functionality
    console.log('🖼️ Gallery upload selected');
    
    setTimeout(() => {
      setIsLoading(false);
      setUploadMethod(null);
      console.log('🖼️ Gallery functionality coming soon!');
    }, 1000);
  };

  const handleSkip = () => {
    console.log('⏭️ Skipping picture upload');
    
    // TODO: Navigate to next step (dashboard/lobby)
    // For now, navigate back
    back();
  };

  return (
    <PageLayout 
      showHeader={true} 
      onMenuAction={handleMenuAction}
      onBack={back}
    >
      <main className="flex flex-col items-center justify-between w-full min-h-[calc(100vh-88px)] py-8 px-4">
        
        {/* Top Section - Character Image */}
        <div className="flex justify-center w-full mb-4">
          <div className="w-[142px] h-[142px]" data-testid="picture-upload-character-image">
            <AnimatedImage
              src="/images/game-assets/woman_take_picture.png"
              alt="Woman taking picture"
              size="custom"
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        {/* Middle Section - Text Content */}
        <div className="w-full max-w-[370px] text-center text-white mb-8" data-testid="picture-upload-title">
          <p className="text-[35px] leading-tight mb-6" dir="auto">
            {texts.pictureUpload.title}
          </p>
          <p className="text-[22px] leading-snug mb-4" dir="auto">
            {texts.pictureUpload.subtitle}
          </p>
          <p className="leading-snug" dir="auto" data-testid="picture-upload-instructions">
            <span className="text-[22px]">{texts.pictureUpload.instructions.split('הכי')[0]}</span>
            <span className="font-bold text-[#f3a257] text-[28px]">הכי</span>
            <span className="text-[22px]">{texts.pictureUpload.instructions.split('הכי')[1] || ' פוטוגנית שלכם.'}</span>
          </p>
        </div>

        {/* Camera Button Section */}
        <div className="flex justify-center w-full mb-12">
          <button
            onClick={handleCameraUpload}
            disabled={isLoading}
            data-testid="camera-upload-button"
            className="bg-white rounded-[30px] w-[123px] h-[123px] transition-all duration-500 hover:scale-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed relative animate-entrance"
          >
            {/* Dashed border */}
            <div className="absolute border-4 border-[#faaf5c] border-dashed inset-0 pointer-events-none rounded-[30px] animate-pulse-slow" />
            
            {/* Camera Icon */}
            <div className="flex flex-col items-center justify-center h-full animate-zoom-in">
              <div className="w-[55px] h-[55px] mb-2">
                {uploadMethod === 'camera' && isLoading ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="w-8 h-8 border-2 border-black rounded-full border-t-transparent animate-spin"></div>
                  </div>
                ) : (
                  <svg className="block size-full animate-bounce-light" fill="none" preserveAspectRatio="none" viewBox="0 0 55 55">
                    <g>
                      <path
                        d="M20.0521 29.2188C20.0521 27.2434 20.8368 25.349 22.2335 23.9523C23.6303 22.5555 25.5247 21.7708 27.5 21.7708C29.4753 21.7708 31.3697 22.5555 32.7665 23.9523C34.1632 25.349 34.9479 27.2434 34.9479 29.2188C34.9479 31.1941 34.1632 33.0885 32.7665 34.4852C31.3697 35.882 29.4753 36.6667 27.5 36.6667C25.5247 36.6667 23.6303 35.882 22.2335 34.4852C20.8368 33.0885 20.0521 31.1941 20.0521 29.2188Z"
                        fill="black"
                      />
                      <path
                        d="M18.0629 4.58333H36.9371L40.3746 11.4583H52.7083V48.125H2.29167V11.4583H14.6254L18.0629 4.58333ZM15.4687 29.2188C15.4687 32.4096 16.7363 35.4698 18.9926 37.7261C21.2489 39.9824 24.3091 41.25 27.5 41.25C30.6909 41.25 33.7511 39.9824 36.0074 37.7261C38.2637 35.4698 39.5312 32.4096 39.5312 29.2188C39.5312 26.0279 38.2637 22.9677 36.0074 20.7114C33.7511 18.4551 30.6909 17.1875 27.5 17.1875C24.3091 17.1875 21.2489 18.4551 18.9926 20.7114C16.7363 22.9677 15.4687 26.0279 15.4687 29.2188Z"
                        fill="black"
                      />
                    </g>
                  </svg>
                )}
              </div>
              
              {/* Button Text */}
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text font-bold text-[16px] text-center text-transparent">
                <p className="leading-normal whitespace-pre" dir="auto">
                  {texts.pictureUpload.cameraButtonText}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* WhatsApp Button */}
        <div className="flex justify-center w-full mb-10">
          <button
            onClick={handleGalleryUpload}
            disabled={isLoading}
            data-testid="gallery-upload-button"
            className="min-w-[250px] rounded-[20px] border-2 border-white bg-transparent transition-all duration-300 hover:scale-105 hover:bg-white hover:text-purple-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            <div className="flex flex-row items-center justify-center gap-2.5 p-[10px]">
              {/* WhatsApp icon on the right for RTL */}
              <div className="w-[22px] h-[22px] transition-transform duration-300 group-hover:scale-125">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
                  <g clipPath="url(#clip0_333_2146)">
                    <path d="M0.469477 10.9532C0.468961 12.8161 0.955711 14.6351 1.88126 16.2383L0.380961 21.7161L5.98684 20.2463C7.53735 21.0903 9.27458 21.5326 11.04 21.5328H11.0446C16.8725 21.5328 21.6165 16.7905 21.619 10.9616C21.6201 8.13708 20.5211 5.48109 18.5244 3.48288C16.5281 1.48483 13.8731 0.383883 11.0442 0.382594C5.21563 0.382594 0.471969 5.12463 0.469563 10.9532" fill="url(#paint0_linear_333_2146)" />
                    <path d="M0.0919531 10.9498C0.0913516 12.8797 0.595547 14.7637 1.55409 16.4244L0 22.0986L5.80688 20.576C7.40687 21.4484 9.20829 21.9083 11.0413 21.909H11.0461C17.083 21.909 21.9974 16.9961 22 10.9586C22.001 8.03258 20.8625 5.28112 18.7945 3.21131C16.7263 1.14177 13.9763 0.00120313 11.0461 0C5.00809 0 0.0943594 4.91219 0.0919531 10.9498ZM3.55016 16.1384L3.33334 15.7942C2.42189 14.3449 1.94081 12.6702 1.9415 10.9505C1.94339 5.93218 6.02748 1.84938 11.0495 1.84938C13.4815 1.85041 15.7671 2.79847 17.4862 4.51859C19.2052 6.23889 20.1511 8.52569 20.1505 10.9579C20.1483 15.9762 16.0641 20.0595 11.0461 20.0595H11.0425C9.40852 20.0587 7.80605 19.6199 6.40853 18.7907L6.07595 18.5934L2.63003 19.4969L3.55016 16.1384Z" fill="url(#paint1_linear_333_2146)" />
                    <path d="M8.30827 6.37209C8.10322 5.91637 7.88743 5.90717 7.69244 5.89918C7.53277 5.8923 7.35023 5.89282 7.16788 5.89282C6.98534 5.89282 6.68877 5.96148 6.43809 6.2352C6.18716 6.50916 5.48006 7.17123 5.48006 8.51778C5.48006 9.86434 6.46087 11.1658 6.59759 11.3486C6.73449 11.531 8.49106 14.3828 11.273 15.4798C13.5851 16.3915 14.0556 16.2102 14.5574 16.1645C15.0593 16.119 16.1768 15.5026 16.4048 14.8635C16.6329 14.2245 16.6329 13.6767 16.5645 13.5622C16.4961 13.4482 16.3136 13.3797 16.0399 13.2429C15.7662 13.1061 14.4205 12.4438 14.1696 12.3525C13.9187 12.2612 13.7363 12.2157 13.5537 12.4897C13.3712 12.7634 12.8471 13.3797 12.6873 13.5622C12.5277 13.7452 12.368 13.768 12.0943 13.6311C11.8204 13.4937 10.939 13.2051 9.89321 12.2727C9.07956 11.5473 8.53024 10.6514 8.37057 10.3773C8.2109 10.1037 8.35347 9.95534 8.49071 9.81896C8.61369 9.69633 8.76451 9.49936 8.90149 9.3396C9.03796 9.17976 9.08351 9.06572 9.17477 8.88319C9.26613 8.70048 9.22041 8.54064 9.15209 8.40374C9.08351 8.26684 8.55164 6.91324 8.30827 6.37209Z" fill="white" />
                  </g>
                  <defs>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_333_2146" x1="1062.28" x2="1062.28" y1="2133.74" y2="0.382594">
                      <stop stopColor="#1EAF38" />
                      <stop offset="1" stopColor="#60D669" />
                    </linearGradient>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_333_2146" x1="1100" x2="1100" y1="2209.86" y2="0">
                      <stop stopColor="#F9F9F9" />
                      <stop offset="1" stopColor="white" />
                    </linearGradient>
                    <clipPath id="clip0_333_2146">
                      <rect fill="white" height="22" width="22" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="text-white text-[17px] text-center group-hover:text-purple-700 transition-colors duration-300">
                {uploadMethod === 'gallery' && isLoading ? (
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin group-hover:border-purple-700 group-hover:border-t-transparent"></div>
                ) : (
                  <p className="leading-normal whitespace-pre" dir="auto">
                    {texts.pictureUpload.whatsappButtonText}
                  </p>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Skip Option - Bottom underlined text */}
        <div className="pt-4 mt-auto">
          <button
            onClick={handleSkip}
            disabled={isLoading}
            data-testid="skip-picture-button"
            className="min-w-[250px] bg-transparent transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="text-white text-[20px] text-center">
              <p className="block leading-normal underline whitespace-pre" dir="auto">
                {texts.pictureUpload.skipOption}
              </p>
            </div>
          </button>
        </div>

        {/* Fun Loading State */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
              <p className="text-lg text-white animate-pulse">
                {uploadMethod === 'camera' ? '📸 מכין מצלמה...' : '🖼️ פותח גלריה...'}
              </p>
            </div>
          </div>
        )}
      
      </main>
    </PageLayout>
  );
}
