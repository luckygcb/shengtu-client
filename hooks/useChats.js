import { useState, useEffect, useCallback } from 'react';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useAssistantAvatar } from './useAssistantAvatar';
import { getDeviceId } from '../utils/device';


export function useChats () {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getAvatar } = useAssistantAvatar();
  const router = useRoute();

  const fetchChats = async () => {
    setLoading(true);
    setChats([]);
    try {
      const deviceId = await getDeviceId();
      const response = await fetch(`https://echojourney.yuanfudao.biz/echojourney/titles?deviceId=${deviceId}`);
      const chats = await response.json();
  
      chats.forEach(chat => {
        chat.avatar = getAvatar(chat.scene);
      });
  
      setChats(chats);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }

  };

  useFocusEffect(
    useCallback(() => {
      if (router.name === 'Home') {
        fetchChats();
      }

    }, [router.name])
  );

  return {
    chats,
    loading
  };
}
