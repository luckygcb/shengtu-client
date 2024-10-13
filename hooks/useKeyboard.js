import { useEffect, useState } from "react";
import { Dimensions, useWindowDimensions } from "react-native";
import { detectMobileOperatingSystem } from '../utils/os';

export function useKeyboard (inputRef) {
  const { height: screenHeight } = useWindowDimensions();
  const [keyboardStatus, setKeyboardStatus] = useState('键盘收起');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const os = detectMobileOperatingSystem();

  const handleResize = () => {
    setTimeout(() => {
      setKeyboardHeight(Math.max(0, window.innerHeight - window.visualViewport.height));
    }, 800);
  }

  useEffect(() => {
    if (os === 'Android') {
      window.addEventListener('resize', handleResize, false);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (keyboardHeight > 0) {
      document.scrollingElement.scrollIntoView();
    }
  }, [keyboardHeight]);

  return {
    screenHeight,
    keyboardStatus,
    keyboardHeight,
  }
}
