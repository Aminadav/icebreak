
import badges from '../../../shared/BADGES.json';

export { badges };

export interface Badge {
  id: string;
  name: string;
  pointsRequired: number;
}

export interface Friend {
  userId: string;
  name: string;
  image: string;
}


export const mockFriends: Friend[] = [
  { userId: "1", name: "משה מרילוס", image: '/images/badges/badge-sample.webp' },
  { userId: "2", name: "דני גמבום", image: '/images/badges/badge-sample.webp' },
  { userId: "3", name: "ישראל לורנץ", image: '/images/badges/badge-sample.webp' },
  { userId: "4", name: "רם טרשתי", image: '/images/badges/badge-sample.webp' },
  { userId: "5", name: "אליכם הכהן כראזי", image: '/images/badges/badge-sample.webp' },
  { userId: "6", name: "רפי כהן", image: '/images/badges/badge-sample.webp' },
  { userId: "7", name: "שלמה לוי", image: '/images/badges/badge-sample.webp' }
];

export function getCurrentBadge(points: number): Badge | null {
  for (let i = badges.length - 1; i >= 0; i--) {
    if (points >= badges[i].pointsRequired) {
      return badges[i];
    }
  }
  return null;
}

export function getNextBadge(points: number): Badge | null {
  for (let i = 0; i < badges.length; i++) {
    if (points < badges[i].pointsRequired) {
      return badges[i];
    }
  }
  return null;
}

export function getBadgeImage(badgeId: string): string {
  return `/images/badges/${badgeId}.png`;
}

export function getProgressToNextLevel(points: number): { current: number; needed: number; percentage: number } {
  const nextBadge = getNextBadge(points);
  if (!nextBadge) {
    return { current: points, needed: 0, percentage: 100 };
  }
  
  const currentBadge = getCurrentBadge(points);
  const previousPoints = currentBadge ? currentBadge.pointsRequired : 0;
  const totalNeeded = nextBadge.pointsRequired - previousPoints;
  const currentProgress = points - previousPoints;
  const percentage = Math.min((currentProgress / totalNeeded) * 100, 100);
  
  return {
    current: points,
    needed: nextBadge.pointsRequired - points,
    percentage
  };
}