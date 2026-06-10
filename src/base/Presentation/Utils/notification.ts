export const displayBrowserNotification = (
  title: string,
  body: string,
  icon: string = 'https://laravel.com/img/notification-icon.png',
  functionClick: () => void,
) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: body,
      icon: icon,
      tag: 'notification-tag',
      requireInteraction: true,
    });
    playNotificationSound();

    // Add click handler
    notification.addEventListener('click', function () {
      // Focus the window
      window.focus();

      // Navigate to the URL
      functionClick();
      // Close notification after click
      notification.close();
    });
  } else {
    console.warn('Notification permission not granted.');

    // Optional: request permission
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        // console.log('Notification permission granted.');
      }
    });
  }
};

// Option 3: Triple beep notification (more noticeable)
const NOTIFICATION_SOUND_TRIPLE =
  'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2W56+mmUBELTKXh8bllHAU2jdXvyn0tBSh+zPLaizsKGGS46Om1XBoFM4nU8c1+LgYngM3y3I4+ChlluOvpplARC0ul4fG5ZRwFNo3V78p9LQUofszy2os7ChhluevrpVERC0yn4fG3ZBwFOI7U8ct+LQUoftDy24k7ChZluujoplARDEul4e+3ZRwGOY/V8Mp/LgYpf9Dy3Ik7CxZluejpplARDEym4fG3ZBwFOI/V8cp+LQYoftDy24o7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuujqplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/';

const playNotificationSound = () => {
  const audio = new Audio(NOTIFICATION_SOUND_TRIPLE);
  audio.play();
};
