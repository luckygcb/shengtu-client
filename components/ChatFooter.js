import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, TextInput, IconButton, Icon } from 'react-native-paper';
import { Audio } from 'expo-av';
import { detectMobileOperatingSystem } from '../utils/os';

const ChatFooter = ({ onSendText, onSendAudio, recordState, setRecordState }) => {

  const [inputMode, setInputMode] = useState('text');
  const [inputText, setInputText] = useState('');
  const recordingRef = useRef();
  const isPressingRef = useRef(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const isRecording = recordState === 'recording';

  async function handlePressIn () {
    console.log('startRecording');
    isPressingRef.current = true;
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

      // 已经松开了
      if (!isPressingRef.current) {
        await recording.stopAndUnloadAsync();
        setRecordState('');
        return;
      }
      recordingRef.current = recording;
      setRecordState('recording');
    } catch (err) {
      console.error('Failed to start recording', err);
      setRecordState(detectMobileOperatingSystem() + ': ' + err.message);
    }
  }

  async function handlePressOut () {
    console.log('stopRecording', recordingRef.current);
    isPressingRef.current = false;
    if (!recordingRef.current) {
      setRecordState('');
      return;
    };

    setRecordState('');
    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = undefined;
    console.log('Recording stopped and stored at', uri);

    onSendAudio?.(uri);
  }

  const toggleInputMode = () => {
    setInputMode(inputMode === 'text' ? 'audio' : 'text');
  };

  const handleSendText = () => {
    const text = inputText.trim();
    setInputText('');
    text && onSendText?.(text);
  }

  const handleKeyPress = (event) => {
    if (event.nativeEvent.key === 'Enter') {
      handleSendText();
    }
  }

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  return (
    <View
      style={[styles.container, {
        backgroundColor: isRecording ? 'rgba(127,85,224,1)' : '#fff'
      }]}
    >
      {inputMode === 'audio' ? (
        <Button
          style={styles.talkButton}
          contentStyle={styles.talkButtonContent}
          labelStyle={[styles.buttonText, {
            color: isRecording ? '#fff' : '#000'
          }]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={() => {}}
        >
          按住说话
        </Button>
      ) : (
        <TextInput
          value={inputText}
          placeholder="发消息..."
          onChangeText={setInputText}
          style={styles.textInput}
          underlineColor='transparent'
          activeUnderlineColor='transparent'
          // right={<TextInput.Icon icon="send" color="#181a1f" onPress={handleSendText} />}
          onKeyPress={handleKeyPress}
        />
      )}
      <IconButton
        style={styles.switchButton}
        icon={() => <Icon size={26} color={isRecording ? '#fff' : '#181a1f'} source={inputMode === 'text' ? "microphone-outline" : "keyboard-outline"} />}
        onPress={toggleInputMode}
      />
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 3px 15px rgba(0,0,0,0.2)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    })
  },
  talkButton: {
    flex: 1,
    height: '100%',
    borderRadius: 12,
  },
  talkButtonContent: {
    height: '100%',
  },
  buttonText: {
    lineHeight: 60,
    marginVertical: 0,
    userSelect: 'none',
    paddingHorizontal: 50,
    color: '#000',
    fontSize: 16,
    fontWeight: 600,
  },
  text: {
    fontSize: 16,
  },
  switchButton: {
    position: 'absolute',
    top: 5,
    right: 0,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderRadius: 5,
    marginRight: 40,
    backgroundColor: '#fff',
  },
  recording: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  }
});

export default ChatFooter;