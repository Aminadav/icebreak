import { ReactElement } from 'react';
import HomePage from '../pages/HomePage';
import GiveGameNamePage from '../pages/GiveGameNamePage';
import EnterPhoneNumberPage from '../pages/EnterPhoneNumberPage';
import Enter2faCodePage from '../pages/Enter2faCodePage';
import EnterEmailPage from '../pages/EnterEmailPage';
import EnterNamePage from '../pages/EnterNamePage';

// Journey states that match the backend
export type JourneyState = 
  | 'INITIAL' 
  | 'GAME_NAME_ENTRY'
  | 'GAME_NAME_SET' 
  | 'PHONE_SUBMITTED' 
  | 'PHONE_VERIFIED' 
  | 'EMAIL_SAVED' 
  | 'COMPLETED';

export interface NavigationData {
  phoneNumber?: string;
  userId?: string;
  email?: string;
  pendingGameName?: string;
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
        
      case 'COMPLETED':
        // Could navigate to game lobby or dashboard
        return <HomePage />;
        
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
      'COMPLETED': 'Registration completed'
    };
    
    return descriptions[journeyState] || 'Unknown state';
  }
}
