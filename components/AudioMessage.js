import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import Volume from './Volume';

const AudioMessage = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  async function playRecording(uri) {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setIsPlaying(true);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Failed to play recording', error);
      setIsPlaying(false);
    }
  }

  return (
    <Pressable 
      style={[styles.audioMessage, message.sender === 'user' ? styles.userAudioMessage : styles.assistantAudioMessage]}
      onPress={() => playRecording(message.uri)}
    >
      <Volume
        isPlaying={isPlaying} 
        color={message.sender === 'user' ? '#fff' : '#000'} 
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  audioMessage: {
    width: '30%',
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  assistantAudioMessage: {
    backgroundColor: '#f3f4f6',
    flexDirection: 'row-reverse',
  },
  userAudioMessage: {
    backgroundColor: '#987fe0',
  },
});

export default AudioMessage;
