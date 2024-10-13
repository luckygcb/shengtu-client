import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import { Button, Icon, TextInput, IconButton, Text } from 'react-native-paper';
import { Audio } from 'expo-av';
import { useHeaderHeight } from '@react-navigation/elements';
import ChatMessage from './ChatMessage';
import { useWebSocket } from '../hooks/useWebSocket';
import { UpwardMessageType, AudioMessage, StudentMessage } from '../proto/upward_pb';
import { blobUrlToUint8Array } from '../utils/binary';
import { detectMobileOperatingSystem } from '../utils/os';


export default function ChatScreen() {

  const [inputMode, setInputMode] = useState('text');
  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState();
  const [messages, setMessages] = useState([]);
  const [recordState, setRecordState] = useState('');
  const expectedSentenceRef = useRef('');
  const currentRoundRef = useRef([]);
  const flatListRef = useRef();
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const { height: screenHeight } = useWindowDimensions();
  const headerHeight = useHeaderHeight();

  const toggleInputMode = () => {
    setInputMode(inputMode === 'text' ? 'audio' : 'text');
  };

  const pushMessage = (message) => {
    if (message.sender === 'assistant') {
      currentRoundRef.current.push(message);
    } else {
      currentRoundRef.current = [];
    }

    setMessages(prevMessages => {
      
      const result = prevMessages.filter(m => m.type !== 'loading');
      const newMessage = {
        id: prevMessages.length ? prevMessages[prevMessages.length - 1].id + 1 : 0,
        isNewRound: message.sender === 'user' || currentRoundRef.current.length === 1,
        ...message,
      };
      result.push(newMessage);

      // 如果当前消息是用户消息，则推送一个 loading 消息
      if (newMessage.sender === 'user') {
        result.push({ sender: 'assistant', type: 'loading', isNewRound: true, id: `loading-${newMessage.id}` });
      }

      return result;
    });
  }

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
   
    if (expectedArticulation.length) {
      expectedSentenceRef.current = expectedArticulation.map(m => m.word).join('');
      pushMessage({ sender: 'assistant', type: 'spell_messages', messages: expectedArticulation, audio: message.audio });
    }

    if (actualArticulation.length) {
      pushMessage({ sender: 'assistant', type: 'text', text: '你的声音听起来像: ', bold: true });
      pushMessage({ sender: 'assistant', type: 'spell_messages', messages: actualArticulation });
    }

    if (message.suggestions) {
      pushMessage({ sender: 'assistant', type: 'text', text: '调整建议: ', bold: true });
      pushMessage({ sender: 'assistant', type: 'text', text: message.suggestions });
    }
  }

  const { sendUpwardMessage } =  useWebSocket(handleMessage);

  useEffect(() => {
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  const handleSendText = () => {
    if (inputText.trim()) {
      console.log('Sending message:', inputText);
      setInputText('');
      pushMessage({ sender: 'user', type: 'text', text: inputText });
      sendUpwardMessage(UpwardMessageType.STUDENT_MESSAGE, new StudentMessage({
        text: inputText,
      }));
    }
  };

  async function startRecording() {
    console.log('startRecording');
    setRecordState('preparing');
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        web: {
          mimeType: detectMobileOperatingSystem() === 'iOS' ? 'audio/mp4' : 'audio/webm',
          bitsPerSecond: 16000,
        },
      });
      setRecording(recording);
      setRecordState('recording');
    } catch (err) {
      console.error('Failed to start recording', err);
      setRecordState(detectMobileOperatingSystem() + ': ' + err.message);
    }
  }

  async function stopRecording() {
    console.log('stopRecording');
    if (!recording) return;
    setRecording(undefined);
    setRecordState('');
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    
    // Add the new recording to the messages list
    pushMessage({ id: Date.now().toString(), sender: 'user', type: 'audio', uri: uri });

    if (/blob:/.test(uri)) {
      const uint8Array = await blobUrlToUint8Array(uri);
      const audioMessage = new AudioMessage({
        audioData: uint8Array,
        expectedSentence: expectedSentenceRef.current,
      });
      console.log('Sending audio message:', audioMessage);
      sendUpwardMessage(UpwardMessageType.AUDIO_MESSAGE, audioMessage);
    }
  }

  const renderMessage = ({ item }) => {
    return <ChatMessage message={item} />;
  };

  const getStatusText = () => {
    if (recordState === 'recording') {
      return '松开结束';
    } else if (recordState === 'preparing') {
      return '录音准备中...';
    }
    return recordState;
  }

  const handleKeyPress = (event) => {
    if (event.nativeEvent.key === 'Enter') {
      handleSendText();
    }
  }

  useEffect(() => {
    if (flatListRef.current) {
      // 延时滚动，避免内容还没渲染完成
      setTimeout(() => {
        flatListRef.current.scrollToEnd();
      }, 100);
    }
  }, [messages.length]);

  return (
    <View
      style={[styles.container, {
        height: screenHeight - headerHeight
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
      <View style={styles.buttonContainer}>
        {inputMode === 'audio' ? (
          <Button
            mode="contained"
            buttonColor="rgba(99,106,232,1)"
            style={styles.talkButton}
            labelStyle={styles.buttonText}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            onLongPress={() => {}}
          >
            按住说话
          </Button>
        ) : (
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            style={styles.textInput}
            underlineColor='transparent'
            activeUnderlineColor='transparent'
            right={<TextInput.Icon icon="send" color="rgba(99,106,232,1)" onPress={handleSendText} />}
            onKeyPress={handleKeyPress}
          />
        )}
        <IconButton
          style={styles.switchButton}
          icon={() => <Icon size={24} color="rgba(99,106,232,1)" source={inputMode === 'text' ? "microphone-outline" : "keyboard-outline"} />}
          onPress={toggleInputMode}
        />
      </View>
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
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  talkButton: {
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
  },
  buttonText: {
    userSelect: 'none',
    paddingHorizontal: 50,
    color: 'white',
    fontSize: 16,
    fontWeight: 400,
  },
  switchButton: {
    position: 'absolute',
    right: 0,
  },
  textInput: {
    width: '67%',
    height: 40,
    borderRadius: 5,
    backgroundColor: 'rgba(243,244,246,1)',
  }
});