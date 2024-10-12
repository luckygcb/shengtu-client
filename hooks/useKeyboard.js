import { useEffect } from "react";
import { Keyboard } from "react-native";

export function useKeyboard () {
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      alert('keyboardDidShow');
    });

    return () => {
      showSubscription.remove();
    };
  }, []);
}
