/**
 * Device Manager - ניהול מזהה המכשיר ב-localStorage
 */

const DEVICE_ID_KEY = 'icebreak_device_id';

/**
 * קבלת מזהה המכשיר מ-localStorage
 */
export function getDeviceId(): string | null {
  try {
    return localStorage.getItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error('Error getting device ID from localStorage:', error);
    return null;
  }
}

/**
 * שמירת מזהה המכשיר ב-localStorage
 */
export function setDeviceId(deviceId: string): void {
  try {
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    console.log('✅ Device ID saved to localStorage:', deviceId);
  } catch (error) {
    console.error('Error saving device ID to localStorage:', error);
  }
}

/**
 * מחיקת מזהה המכשיר מ-localStorage (לטסטים או איפוס)
 */
export function clearDeviceId(): void {
  try {
    localStorage.removeItem(DEVICE_ID_KEY);
    console.log('🗑️ Device ID cleared from localStorage');
  } catch (error) {
    console.error('Error clearing device ID from localStorage:', error);
  }
}

/**
 * בדיקה אם יש מזהה מכשיר שמור
 */
export function hasDeviceId(): boolean {
  return getDeviceId() !== null;
}
