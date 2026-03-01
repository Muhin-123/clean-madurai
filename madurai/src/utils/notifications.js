/**
 * Notification Management Utility
 */

export const getNotificationPermission = () => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification');
    return 'unsupported';
  }

  const permission = await Notification.requestPermission();
  return permission;
};

export const showLocalNotification = async (title, options = {}) => {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

  const permission = getNotificationPermission();
  if (permission !== 'granted') return;

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      body: 'Clean Madurai Notification',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      ...options,
    });
  } catch (error) {
    console.error('Error showing local notification:', error);
  }
};
