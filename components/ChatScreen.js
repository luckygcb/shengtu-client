import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Button, Icon, TextInput } from 'react-native-paper';
import { Audio } from 'expo-av';
import ChatMessage from './ChatMessage';
import { useWebSocket } from '../hooks/useWebSocket';
import { UpwardMessageType, AudioMessage, StudentMessage } from '../proto/upward_pb';
import { blobUrlToUint8Array } from '../utils/binary';

export default function ChatScreen() {

  const [inputMode, setInputMode] = useState('text');
  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState();
  const [messages, setMessages] = useState([]);
  const expectedSentenceRef = useRef('');
  const currentRoundRef = useRef([]);

  const toggleInputMode = () => {
    setInputMode(inputMode === 'text' ? 'audio' : 'text');
  };

  const pushMessage = (message) => {
    if (message.sender === 'assistant') {
      currentRoundRef.current.push(message);
    } else {
      currentRoundRef.current = [];
    }
    setMessages(prevMessages => [
      {
        id: prevMessages.length ? prevMessages[0].id + 1 : 0,
        showAvatar: message.sender === 'user' || currentRoundRef.current.length === 1,
        ...message,
      },
      ...prevMessages,
    ]);
  }

  const handleMessage = ({ type, message }) => {
    console.log('receive message', type, message);
    if (message.text) {
      pushMessage({ sender: 'assistant', type: 'text', text: message.text });
    }

    if (message.expectedMessages) {
      const nonEmptyMessages = message.expectedMessages.filter(m => m.word.trim());
      if (nonEmptyMessages.length > 0) {
        expectedSentenceRef.current = nonEmptyMessages.map(m => m.word).join('');
        pushMessage({ sender: 'assistant', type: 'spell_messages', messages: nonEmptyMessages });
      }
    }

    if (message.messages) {
      pushMessage({ sender: 'assistant', type: 'text', text: '你的声音听起来像: ', bold: true });
      pushMessage({ sender: 'assistant', type: 'spell_messages', messages: message.messages });
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
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync({
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 16000,
          },
        });
        setRecording(recording);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    setRecording(undefined);
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

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          inverted
        />
      </View>
      <View style={styles.buttonContainer}>
        {inputMode === 'audio' ? (
          <Button
            mode="contained"
            buttonColor="rgba(99,106,232,1)"
            style={styles.talkButton}
            labelStyle={styles.buttonText}
            onPressIn={startRecording}
            onPressOut={stopRecording}
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
          />
        )}
        <Button
          style={styles.switchButton}
          icon={() => <Icon size={30} color="rgba(99,106,232,1)" source={inputMode === 'text' ? "microphone-outline" : "keyboard-outline"} />}
          onPress={toggleInputMode}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  buttonText: {
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
    width: '60%',
    height: 40,
    borderRadius: 5,
    backgroundColor: 'rgba(243,244,246,1)',
  }
});