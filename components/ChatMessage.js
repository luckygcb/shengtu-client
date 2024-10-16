import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Icon, Avatar, Button } from 'react-native-paper';
import Matts from './Matts';
import Letter from './Letter';
import AudioMessage from './AudioMessage';
import Volume from './Volume';
import Loading from './Loading';
import { usePlayAudio } from '../hooks/usePlayAudio';

const ChatMessage = ({ message, onPressCorrectVideo }) => {
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
        <ChatMessageContent message={message} onPressCorrectVideo={onPressCorrectVideo} />
      </View>
    </View>
  )
}

const ChatMessageContent = ({ message, onPressCorrectVideo }) => {

  const { playAudio, isPlaying } = usePlayAudio();

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
  } else if (message.type === 'correct_videos') {
    return (
      <View style={styles.correntVideosMessage}>
        {message.correctVideos.map(correctVideo => (
          <Button
            key={correctVideo.id}
            mode="outlined"
            style={styles.correctVideoButton}
            onPress={() => {
              onPressCorrectVideo(correctVideo.mp4Url);
            }}
          >
            {correctVideo.text}
          </Button>
        ))}
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
  },
  correntVideosMessage: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    flexWrap: 'wrap',
  },
  correctVideoButton: {
    borderRadius: 8,
  }
});

export default ChatMessage;