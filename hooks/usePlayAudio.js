import { useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { detectMobileOperatingSystem } from '../utils/device';

export function usePlayAudio () {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);
  const audioUriRef = useRef(null);

  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
        // 可选：删除文件以释放空间
        FileSystem.deleteAsync(audioUriRef.current, { idempotent: true }).catch((err) => {
          console.warn('删除音频文件失败:', err);
        });
      }
    }
  };

  const playAudio = async (binary) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        // 将 Uint8Array 转换为 Base64 字符串
        const base64String = Buffer.from(binary).toString('base64');

        // 定义音频文件的保存路径
        const fileUri = FileSystem.cacheDirectory + `audio_${Date.now()}.m4a`;

        // 将 Base64 字符串写入文件系统
        await FileSystem.writeAsStringAsync(fileUri, base64String, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // 创建并播放音频
        const { sound } = await Audio.Sound.createAsync(
          { uri: fileUri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );

        audioUriRef.current = fileUri;
        soundRef.current = sound;
        setIsPlaying(true);
      } catch (error) {
        console.error('播放音频失败:', error);
        setIsPlaying(false);
      }
    } else if (Platform.OS === 'web') {
      const blob = new Blob([binary], { type: detectMobileOperatingSystem() === 'iOS' ? 'audio/wav' : 'audio/webm' });
      const uri = URL.createObjectURL(blob);
      const { sound } = await Audio.Sound.createAsync({ uri });
      
      await sound.playAsync();
      setIsPlaying(true);
  
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    }
  }

  return {
    isPlaying,
    playAudio,
  }
}