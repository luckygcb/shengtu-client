import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Icon, Avatar, Button } from 'react-native-paper';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import Matts from './Matts';
import Letter from './Letter';
import AudioMessage from './AudioMessage';
import Volume from './Volume';
import Loading from './Loading';
import { detectMobileOperatingSystem } from '../utils/os';

const ChatMessage = ({ message }) => {
  return (
    <View
      style={[
        styles.messageItem,
        message.sender === 'user' ? styles.userMessage : styles.assistantMessage,
        {
          marginTop: message.isNewRound ? 27 : 0,
        }
      ]}
    >
      <View style={styles.avatarContainer}>
        {message.isNewRound ? (
          message.sender === 'assistant' ? (
            <Avatar.Image size={28} source={require('../assets/images/assistant.jpg')} />
          ) : (
            <Icon source="account" size={28} />
          )
        ) : null}
      </View>
      <View style={[styles.messageContent, {
        flexDirection: message.sender === 'assistant' ? 'row' : 'row-reverse'
      }]}>
        <ChatMessageContent message={message} />
      </View>
    </View>
  )
}

const ChatMessageContent = ({ message }) => {

  const [isPlaying, setIsPlaying] = useState(false);
  const audioUriRef = useRef(null);
  const soundRef = useRef(null);

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
  
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    }
  }

  if (message.type === 'audio') {
    return (
      <AudioMessage message={message} />
    );
  } else if (message.type === 'text') {
    return (
      <Text style={[styles.textMessage, message.bold ? styles.boldText : {}]}>{message.text}</Text>
    );
  } else if (message.type === 'spell_messages') {
    return (
      <View style={styles.spellMessages}>
        {message.messages.map((wordCorrectMessage, index) => (
          <View key={index} style={styles.spellMessageItem}>
            {
              wordCorrectMessage.pinyin ? (
                <Text style={styles.pinyin}>{wordCorrectMessage.pinyin}</Text>
              ) : (
                <View style={styles.spellLetters} >
                  {wordCorrectMessage.initialConsonant ? <Letter letter={wordCorrectMessage.initialConsonant} /> : null}
                  {wordCorrectMessage.vowels ? <Letter letter={wordCorrectMessage.vowels} tone={wordCorrectMessage.tone} /> : null}
                </View> 
              )
            }
            <Matts>
              <Text
                style={[
                  styles.spellWord,
                  { color: wordCorrectMessage.isCorrect === false ? 'rgba(222,59,64,1)' : '#000' }
                ]}
              >
                {wordCorrectMessage.word}
              </Text>
            </Matts>
          </View>
        ))}
        {message.audio && (
          <Pressable
            style={styles.playButton}
            onPress={() => playAudio(message.audio)}
          >
            <Volume isPlaying={isPlaying} color="#987fe0" />
          </Pressable>
        )}
      </View>
    );
  } else if (message.type === 'loading') {
    return (
      <View style={styles.loadingMessage}>
        <Loading />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  messageItem: {
    marginVertical: 5,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatarContainer: {
    width: 28,
    height: 44,
    paddingVertical: 8
  },
  messageContent: {
    flex: 1,
  },
  assistantMessage: {
    flexDirection: 'row',
    paddingRight: 54
  },
  userMessage: {
    flexDirection: 'row-reverse',
    paddingLeft: 54
  },
  textMessage: {
    paddingTop: 13,
    fontSize: 16,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
  },
  spellMessages: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    gap: 10,
    flexWrap: 'wrap',
  },
  spellMessageItem: {
    flexDirection: 'column',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  spellLetters: {
    flexDirection: 'row',
  },
  spellWord: {
    fontSize: 16,
  },
  loadingMessage: {
    paddingTop: 15,
  },
  playButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
  }
});

export default ChatMessage;