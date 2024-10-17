import { useState, useEffect } from 'react';
import { useAssistantAvatar } from './useAssistantAvatar';
import { getDeviceId } from '../utils/device';

export function useChats () {
  const [chats, setChats] = useState([]);
  const { getAvatar } = useAssistantAvatar();

  const fetchChats = async () => {
    const deviceId = await getDeviceId();
    const response = await fetch(`https://echojourney.yuanfudao.biz/echojourney/titles?deviceId=${deviceId}`);
    const chats = await response.json();

    chats.forEach(chat => {
      chat.avatar = getAvatar(chat.scene);
    });

    setChats(chats);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return {
    chats,
  };
}
