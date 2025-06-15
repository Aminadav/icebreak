import { useEffect } from 'react';
import { useTracking } from '../contexts/TrackingContext';

interface PageTrackingProps {
  pageName: string;
  pageData?: Record<string, any>;
}

export default function PageTracking({ pageName, pageData = {} }: PageTrackingProps) {
  const { trackEvent } = useTracking();

  useEffect(() => {
    // Track page view
    trackEvent('page_view', {
      page_name: pageName,
      timestamp: new Date().toISOString(),
      ...pageData
    });
  }, [pageName, trackEvent, pageData]);

  return null; // This component doesn't render anything
}
