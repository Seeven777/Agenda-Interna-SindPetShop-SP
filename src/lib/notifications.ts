import { messaging } from '../firebase/config';
import { getToken, onMessage } from 'firebase/messaging';

let tokenRefreshCallback: ((token: string) => void) | null = null;

export const requestNotificationPermission = async () => {
  if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: 'BC0QGKpBD_5LjTS6pTiURG28jgyGDL9AFWdN38WGifZbqEs6LGqmvBwXvgQFmZPXHslSohDJWmYpmXwQCTtcrIc',
        });
        if (tokenRefreshCallback) tokenRefreshCallback(token!);
        console.log('FCM Token:', token);
        return token;
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  }
  return null;
};

export const onTokenRefresh = (callback: (token: string) => void) => {
  tokenRefreshCallback = callback;
};

onMessage(messaging, (payload) => {
  console.log('Foreground notification:', payload);
  // Show toast or update UI
  if (notificationSound) notificationSound.play();
});

