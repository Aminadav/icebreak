
export interface Badge {
  id: number;
  name: string;
  image: string;
  pointsRequired: number;
  description: string;
  achieversCount: number;
}

export interface Friend {
  userId: string;
  name: string;
  image: string;
}

export const badges: Badge[] = [
  {
    id: 1,
    name: "מתחמם",
    image: '/images/badges/badge-sample.webp',
    pointsRequired: 100,
    description: "תחילת המסע",
    achieversCount: 3
  },
  {
    id: 2,
    name: "שובר קרחים", 
    image: '/images/badges/badge-sample.webp',
    pointsRequired: 400,
    description: "פותח השיחות",
    achieversCount: 3
  },
  {
    id: 3,
    name: "פותח השיחות",
    image: '/images/badges/badge-sample.webp',
    pointsRequired: 800,
    description: "מוביל דיונים",
    achieversCount: 3
  },
  {
    id: 4,
    name: "השראה מהלכת",
    image: '/images/badges/badge-sample.webp',
    pointsRequired: 1500,
    description: "מעורר השראה",
    achieversCount: 3
  },
  {
    id: 5,
    name: "מגדלור אנושי",
    image: '/images/badges/badge-sample.webp',
    pointsRequired: 2500,
    description: "מנהיג טבעי",
    achieversCount: 3
  },
  {
    id: 6,
    name: "נוגע בלבבות",
    image: '/images/badges/badge-sample.webp',
    pointsRequired: 4000,
    description: "משפיע על אחרים",
    achieversCount: 3
  },
  {
    id: 7,
    name: "מעמיק הקשרים",
    image: '/images/badges/badge-sample.webp',
    pointsRequired: 6000,
    description: "בונה קשרים עמוקים",
    achieversCount: 3
  },
  {
    id: 8,
    name: "מרים המסיבות",
    image: '/images/badges/badge-sample.webp',
    pointsRequired: 9000,
    description: "מחיה את האווירה",
    achieversCount: 3
  },
  {
    id: 9,
    name: "מקהיל קהילות",
    image: '/images/badges/badge-sample.webp',
    pointsRequired: 13000,
    description: "מאחד קהילות",
    achieversCount: 3
  },
  {
    id: 10,
    name: "מאחד הלבבות",
    image: '/images/badges/badge-sample.webp',
    pointsRequired: 18000,
    description: "המנהיג הגדול",
    achieversCount: 3
  }
];

export const mockFriends: Friend[] = [
  { userId: "1", name: "משה מרילוס", image: '/images/badges/badge-sample.webp' },
  { userId: "2", name: "דני גמבום", image: '/images/badges/badge-sample.webp' },
  { userId: "3", name: "ישראל לורנץ", image: '/images/badges/badge-sample.webp' },
  { userId: "4", name: "רם טרשתי", image: '/images/badges/badge-sample.webp' },
  { userId: "5", name: "אליכם הכהן כראזי", image: '/images/badges/badge-sample.webp' },
  { userId: "6", name: "רפי כהן", image: '/images/badges/badge-sample.webp' },
  { userId: "7", name: "שלמה לוי", image: '/images/badges/badge-sample.webp' }
];

export function getCurrentBadge(points: number): Badge {
  for (let i = badges.length - 1; i >= 0; i--) {
    if (points >= badges[i].pointsRequired) {
      return badges[i];
    }
  }
  return badges[0];
}

export function getNextBadge(points: number): Badge | null {
  for (let i = 0; i < badges.length; i++) {
    if (points < badges[i].pointsRequired) {
      return badges[i];
    }
  }
  return null;
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