import { ReactElement } from 'react';
import HomePage from '../pages/HomePage';
import GiveGameNamePage from '../pages/GiveGameNamePage';
import EnterPhoneNumberPage from '../pages/EnterPhoneNumberPage';
import Enter2faCodePage from '../pages/Enter2faCodePage';
import EnterEmailPage from '../pages/EnterEmailPage';
import EnterNamePage from '../pages/EnterNamePage';
import SelectGenderPage from '../pages/SelectGenderPage';
import PictureUploadPage from '../pages/PictureUploadPage';
import CameraPage from '../pages/CameraPage';
import ImageGalleryPage from '../pages/ImageGalleryPage';
import CreatorGameReadyPage from '../pages/CreatorGameReadyPage';
import BeforeStartAskAboutYou from '../pages/BeforeStartAskAboutYou';

// Journey states that match the backend
export type JourneyState = 
  | 'INITIAL' 
  | 'GAME_NAME_ENTRY'
  | 'GAME_NAME_SET' 
  | 'PHONE_SUBMITTED' 
  | 'PHONE_VERIFIED' 
  | 'EMAIL_SAVED' 
  | 'NAME_SAVED'
  | 'GENDER_SELECTION'
  | 'PICTURE_UPLOAD'
  | 'CAMERA_ACTIVE'
  | 'PICTURE_ENHANCEMENT'
  | 'IMAGE_GALLERY'
  | 'CREATOR_GAME_READY'
  | 'BEFORE_START_ASK_ABOUT_YOU';

export interface NavigationData {
  phoneNumber?: string;
  userId?: string;
  email?: string;
  pendingGameName?: string;
  name?: string;
  gender?: string;
  pendingImage?: string; // Added for IMAGE_GALLERY state
  selectedImageHash?: string; // Added for CREATOR_GAME_READY state
}

/**
 * NavigationController - Maps journey states to the correct React components
 * This handles automatic navigation based on server-side journey state
 */
export class NavigationController {
  /**
   * Get the component to navigate to based on journey state
   */
  static getComponentForJourneyState(
    journeyState: JourneyState, 
    data: NavigationData = {}
  ): ReactElement {
    console.log(`🎯 NavigationController: Getting component for journey state: ${journeyState}`);
    console.log(`📊 NavigationController: Data:`, data);

    switch (journeyState) {
      case 'INITIAL':
        return <HomePage />;
        
      case 'GAME_NAME_ENTRY':
        return <GiveGameNamePage />;
        
      case 'GAME_NAME_SET':
        return <EnterPhoneNumberPage />;
        
      case 'PHONE_SUBMITTED':
        if (data.phoneNumber) {
          return <Enter2faCodePage phoneNumber={data.phoneNumber} />;
        }
        // Fallback to phone entry if no phone number stored
        return <EnterPhoneNumberPage />;
        
      case 'PHONE_VERIFIED':
        if (data.phoneNumber && data.userId) {
          return <EnterEmailPage phoneNumber={data.phoneNumber} userId={data.userId} />;
        }
        // Fallback to phone entry if missing data
        return <EnterPhoneNumberPage />;
        
      case 'EMAIL_SAVED':
        if (data.phoneNumber && data.userId && data.email) {
          return <EnterNamePage phoneNumber={data.phoneNumber} userId={data.userId} email={data.email} />;
        }
        // Fallback to email entry if missing data
        if (data.phoneNumber && data.userId) {
          return <EnterEmailPage phoneNumber={data.phoneNumber} userId={data.userId} />;
        }
        // Ultimate fallback
        return <EnterPhoneNumberPage />;
        
      case 'NAME_SAVED':
        if (data.phoneNumber && data.userId && data.email && data.name) {
          return <SelectGenderPage phoneNumber={data.phoneNumber} userId={data.userId} email={data.email} name={data.name} />;
        }
        // Fallback to name entry if missing data
        if (data.phoneNumber && data.userId && data.email) {
          return <EnterNamePage phoneNumber={data.phoneNumber} userId={data.userId} email={data.email} />;
        }
        // Further fallbacks
        if (data.phoneNumber && data.userId) {
          return <EnterEmailPage phoneNumber={data.phoneNumber} userId={data.userId} />;
        }
        return <EnterPhoneNumberPage />;
        
      case 'GENDER_SELECTION':
        if (data.phoneNumber && data.userId && data.email && data.name) {
          return <SelectGenderPage phoneNumber={data.phoneNumber} userId={data.userId} email={data.email} name={data.name} />;
        }
        // Fallback to name entry if missing data
        if (data.phoneNumber && data.userId && data.email) {
          return <EnterNamePage phoneNumber={data.phoneNumber} userId={data.userId} email={data.email} />;
        }
        return <EnterPhoneNumberPage />;
        
      case 'PICTURE_UPLOAD':
        if (data.phoneNumber && data.userId && data.email && data.name && data.gender) {
          return <PictureUploadPage phoneNumber={data.phoneNumber} userId={data.userId} email={data.email} name={data.name} gender={data.gender} />;
        }
        // Fallback to gender selection if missing data
        if (data.phoneNumber && data.userId && data.email && data.name) {
          return <SelectGenderPage phoneNumber={data.phoneNumber} userId={data.userId} email={data.email} name={data.name} />;
        }
        return <EnterPhoneNumberPage />;
        
      case 'CAMERA_ACTIVE':
        if (data.phoneNumber && data.userId && data.email && data.name && data.gender) {
          return <CameraPage phoneNumber={data.phoneNumber} userId={data.userId} email={data.email} name={data.name} gender={data.gender} />;
        }
        // Fallback to picture upload if missing data
        if (data.phoneNumber && data.userId && data.email && data.name && data.gender) {
          return <PictureUploadPage phoneNumber={data.phoneNumber} userId={data.userId} email={data.email} name={data.name} gender={data.gender} />;
        }
        return <EnterPhoneNumberPage />;
        
      case 'PICTURE_ENHANCEMENT':
        // For picture enhancement, we need a captured image blob, but since we can't store blobs in navigation data,
        // this state should only be reached through camera capture flow, not auto-navigation
        // Fallback to camera or picture upload page
        if (data.phoneNumber && data.userId && data.email && data.name && data.gender) {
          return <CameraPage phoneNumber={data.phoneNumber} userId={data.userId} email={data.email} name={data.name} gender={data.gender} />;
        }
        return <EnterPhoneNumberPage />;
        
      case 'IMAGE_GALLERY':
        // If we have all required data including the pending image, show the gallery
        if (data.phoneNumber && data.userId && data.email && data.name && data.gender && data.pendingImage) {
          return <ImageGalleryPage 
            originalImageHash={data.pendingImage}
            phoneNumber={data.phoneNumber} 
            userId={data.userId} 
            email={data.email} 
            name={data.name} 
            gender={data.gender}
          />;
        }
        // Fallback to picture upload page if missing data
        if (data.phoneNumber && data.userId && data.email && data.name && data.gender) {
          return <PictureUploadPage phoneNumber={data.phoneNumber} userId={data.userId} email={data.email} name={data.name} gender={data.gender} />;
        }
        return <EnterPhoneNumberPage />;
        
      case 'CREATOR_GAME_READY':
        if (data.phoneNumber && data.userId && data.email && data.name && data.gender) {
          return <CreatorGameReadyPage 
            phoneNumber={data.phoneNumber} 
            userId={data.userId} 
            email={data.email} 
            name={data.name} 
            gender={data.gender}
            selectedImageHash={data.selectedImageHash || 'no-image'}
          />;
        }
        // Fallback to picture upload if missing data
        if (data.phoneNumber && data.userId && data.email && data.name && data.gender) {
          return <PictureUploadPage phoneNumber={data.phoneNumber} userId={data.userId} email={data.email} name={data.name} gender={data.gender} />;
        }
        return <EnterPhoneNumberPage />;

      case 'BEFORE_START_ASK_ABOUT_YOU':
        if (data.phoneNumber && data.userId && data.email && data.name && data.gender) {
          return <BeforeStartAskAboutYou 
            phoneNumber={data.phoneNumber} 
            userId={data.userId} 
            email={data.email} 
            name={data.name} 
            gender={data.gender}
            selectedImageHash={data.selectedImageHash || 'no-image'}
          />;
        }
        // Fallback to creator game ready if missing data
        if (data.phoneNumber && data.userId && data.email && data.name && data.gender) {
          return <CreatorGameReadyPage 
            phoneNumber={data.phoneNumber} 
            userId={data.userId} 
            email={data.email} 
            name={data.name} 
            gender={data.gender}
            selectedImageHash={data.selectedImageHash || 'no-image'}
          />;
        }
        return <EnterPhoneNumberPage />;

        
      default:
        console.warn(`⚠️ NavigationController: Unknown journey state: ${journeyState}, defaulting to INITIAL`);
        return <HomePage />;
    }
  }

  /**
   * Determine if we should auto-navigate based on journey state
   */
  static shouldAutoNavigate(journeyState: JourneyState): boolean {
    // Don't auto-navigate if we're at the initial state
    return journeyState !== 'INITIAL';
  }

  /**
   * Get a human-readable description of the journey state
   */
  static getJourneyStateDescription(journeyState: JourneyState): string {
    const descriptions: Record<JourneyState, string> = {
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
    
    return descriptions[journeyState] || 'Unknown state';
  }
}
