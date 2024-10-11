import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon, Avatar } from 'react-native-paper';
import { Audio } from 'expo-av';
import Matts from './Matts';
import Letter from './Letter';

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
      <Pressable 
        style={[styles.audioMessage, message.sender === 'user' ? styles.userAudioMessage : styles.assistantAudioMessage]}
        onPress={() => playRecording(message.uri)}
      >
        <Icon source="volume-high" size={24} color={message.sender === 'user' ? '#fff' : '#000'} />
      </Pressable>
    );
  } else if (message.type === 'text') {
    return (
      <Text style={[styles.textMessage, message.bold ? styles.boldText : {}]}>{message.text}</Text>
    );
  } else if (message.type === 'spell_messages') {
    return (
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
  audioMessage: {
    width: '30%',
    height: 44,
    borderRadius: 10,
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
  textMessage: {
    paddingTop: 13,
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