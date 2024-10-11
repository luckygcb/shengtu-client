export function detectMobileOperatingSystem() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // 判断是否是 iOS 设备
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS';
  }

  // 判断是否是 Android 设备
  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  return 'unknown';
}