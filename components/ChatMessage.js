import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { Audio } from 'expo-av';
import Matts from './Matts';
import Letter from './Letter';

const ChatMessage = ({ message }) => {
  async function playRecording(uri) {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play recording', error);
    }
  }

  if (message.type === 'audio') {
    return (
      <View style={[styles.messageItem, message.sender === 'user' ? styles.userMessage : styles.assistantMessage]}>
        <Pressable 
          style={[styles.audioMessage, message.sender === 'user' ? styles.userAudioMessage : styles.assistantAudioMessage]}
          onPress={() => playRecording(message.uri)}
        >
          <Icon source="volume-high" size={24} color={message.sender === 'user' ? '#fff' : '#000'} />
        </Pressable>
      </View>
    );
  } else if (message.type === 'text') {
    return (
      <View style={[styles.messageItem, message.sender === 'user' ? styles.userMessage : styles.assistantMessage]}>
        <Text style={[styles.textMessage, message.bold ? styles.boldText : {}]}>{message.text}</Text>
      </View>
    );
  } else if (message.type === 'spell_messages') {
    return (
      <View style={[styles.messageItem, styles.assistantMessage]}>
        <View style={styles.spellMessages}>
          {message.messages.map((message, index) => (
            <View key={index} style={styles.spellMessageItem}>
              <View style={styles.spellLetters} >
                {message.initialConsonant ? <Letter letter={message.initialConsonant} /> : null}
                {message.vowels ? <Letter letter={message.vowels} tone={message.tone} /> : null}
              </View>
              <Matts>
                <Text style={styles.spellWord}>{message.word}</Text>
              </Matts>
            </View>
          ))}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  messageItem: {
    padding: 10,
    marginVertical: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assistantMessage: {
    flexDirection: 'row',
  },
  userMessage: {
    flexDirection: 'row-reverse',
  },
  audioMessage: {
    width: '30%',
    padding: 10,
    borderRadius: 10,
  },
  assistantAudioMessage: {
    backgroundColor: '#f3f4f6',
    flexDirection: 'row-reverse',
  },
  userAudioMessage: {
    backgroundColor: '#987fe0',
  },
  boldText: {
    fontWeight: 'bold',
  },
  spellMessages: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  spellMessageItem: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  spellLetters: {
    flexDirection: 'row',
  },
  spellWord: {
    fontSize: 16,
  }
});

export default ChatMessage;