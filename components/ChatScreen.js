import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import ChatMessage from './ChatMessage';
import { useWebSocket } from '../hooks/useWebSocket';
import { UpwardMessageType, AudioMessage, StudentMessage } from '../proto/upward_pb';
import { blobUrlToUint8Array } from '../utils/binary';
import VideoModal from './VideoModal';
import ChatFooter from './ChatFooter';

export default function ChatScreen() {

  const [messages, setMessages] = useState([]);
  const [recordState, setRecordState] = useState('');
  const [correctVideoUri, setCorrectVideoUri] = useState('');
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const expectedSentenceRef = useRef('');
  const messageIdSeedRef = useRef(0);
  const flatListRef = useRef();
  const route = useRoute();
  const chatScene = route.params?.scene;

  const { height: screenHeight } = useWindowDimensions();
  const headerHeight = useHeaderHeight();

  const pushMessage = (message) => {
    setMessages(prevMessages => {
      let result = [...prevMessages];
      const lastMessageGroup = result[result.length - 1];
      
      // Remove any existing loading messages
      if (lastMessageGroup && lastMessageGroup.sender === 'assistant') {
        lastMessageGroup.messages = lastMessageGroup.messages.filter(m => m.type !== 'loading');
      }
  
      const newMessage = {
        id: messageIdSeedRef.current++,
        ...message,
      };

      if (lastMessageGroup && lastMessageGroup.sender === newMessage.sender) {
        // If the last message has the same sender, merge the new message
        lastMessageGroup.messages.push(newMessage);
      } else {
        // Otherwise, create a new group for this sender
        result.push({
          id: newMessage.id,
          sender: newMessage.sender,
          messages: [newMessage],
        });
      }

      return result;
    });

    // If the new message is from the user, add a loading message for the assistant
    if (message.sender === 'user') {
      pushMessage({ sender: 'assistant', type: 'loading' });
    }
  };

  const handleMessage = ({ type, message }) => {
    console.log('receive message', type, message);
    if (message.text) {
      pushMessage({ sender: 'assistant', type: 'text', text: message.text });
    }

    const expectedArticulation = message.expectedMessages?.filter(m => m.word.trim()) ?? [];
    const actualArticulation = message.messages ?? [];

    // 如果实际发音和预期发音长度相同，则检查每个字是否正确
    if (actualArticulation.length > 1 &&  actualArticulation.length === expectedArticulation.length) {
      expectedArticulation.forEach((e, index) => {
        if (e.word !== actualArticulation[index].word) {
          expectedArticulation[index].isCorrect = false;
          actualArticulation[index].isCorrect = false;
        }
      });
    }

    // 评分为0, 不显示
    if (message.accuracyScore && message.fluencyScore) {
      pushMessage({ sender: 'assistant', type: 'text', text: `综合: ${message.accuracyScore} 分  流畅度: ${message.fluencyScore} 分`, bold: true });
    }
   
    if (expectedArticulation.length) {
      expectedSentenceRef.current = expectedArticulation.map(m => m.word).join('');
      pushMessage({ sender: 'assistant', type: 'spell_messages', messages: expectedArticulation, audio: message.audio });
    }

    if (actualArticulation.length) {
      pushMessage({ sender: 'assistant', type: 'text', text: '你的声音听起来像: ', bold: true });
      pushMessage({ sender: 'assistant', type: 'spell_messages', messages: actualArticulation });
    }

    if (message.correctMp4Info?.length) {
      pushMessage({ sender: 'assistant', type: 'text', text: '建议口型视频: ', bold: true });
      pushMessage({ sender: 'assistant', type: 'correct_videos', correctVideos: message.correctMp4Info });
    }

    if (message.suggestions) {
      pushMessage({ sender: 'assistant', type: 'text', text: '调整建议: ', bold: true });
      pushMessage({ sender: 'assistant', type: 'text', text: message.suggestions });
    }
  }

  const handleOpen = () => {
    pushMessage({ sender: 'assistant', type: 'loading' });
  }

  const { sendUpwardMessage } =  useWebSocket(chatScene, { onMessage: handleMessage, onOpen: handleOpen });

  const handleSendText = (text) => {
    console.log('Sending message:', text);
    pushMessage({ sender: 'user', type: 'text', text });
    sendUpwardMessage(UpwardMessageType.STUDENT_MESSAGE, new StudentMessage({
      text,
    }));
  };

  const handleSendAudio = async (uri) => {
    // Add the new recording to the messages list
    pushMessage({ sender: 'user', type: 'audio', uri: uri });

    if (/blob:/.test(uri)) {
      const uint8Array = await blobUrlToUint8Array(uri);
      const audioMessage = new AudioMessage({
        audioData: uint8Array,
        expectedSentence: expectedSentenceRef.current,
      });
      console.log('Sending audio message, length:', audioMessage.audioData.length);
      sendUpwardMessage(UpwardMessageType.AUDIO_MESSAGE, audioMessage);
    } else {
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists) {
          const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
          const uint8Array = new Uint8Array(Buffer.from(fileContent, 'base64'));
          const audioMessage = new AudioMessage({
            audioData: uint8Array,
            expectedSentence: expectedSentenceRef.current,
          });
          console.log('Sending audio message, length:', audioMessage.audioData.length);
          sendUpwardMessage(UpwardMessageType.AUDIO_MESSAGE, audioMessage);
        } else {
          console.error('Audio file does not exist:', uri);
        }
      } catch (error) {
        console.error('Error reading audio file:', error);
      }
    }
  }
  
  const handlePressCorrectVideo = (uri) => {
    setCorrectVideoUri(uri);
    setVideoModalVisible(true);
  }

  const renderMessage = ({ item }) => {
    return <ChatMessage sender={item.sender} messages={item.messages} onPressCorrectVideo={handlePressCorrectVideo} />;
  };

  const getStatusText = () => {
    if (recordState === 'recording') {
      return '松开结束';
    } else if (recordState === 'preparing') {
      return '录音准备中...';
    }
    return recordState;
  }

  useEffect(() => {
    if (flatListRef.current) {
      // 延时滚动，避免内容还没渲染完成
      setTimeout(() => {
        flatListRef.current.scrollToEnd();
      }, 100);
    }
  }, [messages]);

  // iOS 中页面高度变化，需要滚动到页面顶部
  useEffect(() => {
    if (Platform.OS === 'web') {
      setTimeout(() => {
        document.scrollingElement.scrollIntoView();
        flatListRef.current.scrollToEnd();
      }, 200);
    } else {
      flatListRef.current.scrollToEnd();
    }
  }, [screenHeight]);

  return (
    <View
      style={[styles.container, {
        flex: Platform.select({
          web: undefined,
          default: 1,
        }),
        height: Platform.select({
          web: screenHeight - headerHeight,
          default: 'auto',
        }) 
      }]}
    >
      <View style={styles.messageContainer}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          ref={flatListRef}
        />
      </View>
      <Text style={styles.statusText}>{getStatusText()}</Text>
      <View style={styles.footerContainer}>
        <ChatFooter
          onSendText={handleSendText}
          onSendAudio={handleSendAudio}
          recordState={recordState}
          setRecordState={setRecordState}
        />
      </View>
      <VideoModal
        visible={videoModalVisible}
        hideModal={() => setVideoModalVisible(false)}
        uri={correctVideoUri}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
  },
  messageContainer: {
    flex: 1,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  statusText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  textInput: {
    width: '67%',
    height: 40,
    borderRadius: 5,
    backgroundColor: 'rgba(243,244,246,1)',
  }
});