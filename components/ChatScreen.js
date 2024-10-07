import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { Audio } from 'expo-av';
import ChatMessage from './ChatMessage';

export default function ChatScreen() {
  const [recording, setRecording] = useState();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
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
    setMessages(prevMessages => [
      // mock 助手回复
      { id: Date.now().toString() + 2, sender: 'assistant', type: 'audio', uri: uri },
      { id: Date.now().toString() + 1, sender: 'assistant', type: 'text', text: '请听好' },
      { id: Date.now().toString(), sender: 'user', type: 'audio', uri: uri },
      ...prevMessages,
    ]);
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
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? '#f3f4f6' : '#987fe0' }
          ]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        >
          <Text style={styles.buttonText}>按住说话</Text>
        </Pressable>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    width: '80%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});