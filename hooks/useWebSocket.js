import { useState, useEffect } from 'react';
import uuid from 'react-native-uuid';
import { Platform } from 'react-native';
import { UpwardMessage } from '../proto/upward_pb';
import { DownwardMessage, DownwardMessageType, TutorMessage, WordCorrectMessage, SentenceCorrectMessage } from '../proto/downward_pb';
import { detectMobileOperatingSystem } from '../utils/os';
import { getDeviceId } from '../utils/device';

const platform = Platform.OS === 'web' ? (detectMobileOperatingSystem() === 'iOS' ? 'web-ios' : 'web-android') : Platform.OS;
console.log('platform', platform);
export function useWebSocket (onMessage) {
  const [socket, setSocket] = useState(null);

  const connect = async () => {
    const deviceId = await getDeviceId();
    const sessionId = uuid.v4();
    const schema = Platform.OS === 'web' ? (location.protocol.startsWith('https') ? 'wss' : 'ws') : 'ws:';
    const ws = new WebSocket(`${schema}//echo_journey.yuanfudao.biz/echo-journey/ws/talk/${sessionId}?platform=${platform}&deviceId=${deviceId}`);
    setSocket(ws);
    ws.addEventListener('message', handleProtoMessage);
  }

  const disconnect = () => {
    if (!socket) {
      return;
    }
    socket.removeEventListener('message', handleProtoMessage);
    socket.close();
  }

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    }
  }, []);

  const sendUpwardMessage = (type, message) => {
    const upwardMessage = new UpwardMessage({
      type,
      payload: message.toBinary(),
    });

    if (socket) {
      socket.send(upwardMessage.toBinary());
    }
  }

  const closeSocket = () => {
    if (socket) {
      socket.close();
    }
  }

  const handleProtoMessage = async(event) => {
    let downwardMessage;

    if (event.data instanceof ArrayBuffer) {
      downwardMessage = DownwardMessage.fromBinary(new Uint8Array(event.data));
    } else if (event.data instanceof Blob) {
      downwardMessage = DownwardMessage.fromBinary(new Uint8Array(await event.data.arrayBuffer()));
    } else {
      console.log('event.data', event.data);
      throw new Error('Unknown data type: ' + typeof event.data);
    }
    console.log('downwardMessage', downwardMessage);
    let type;
    let message;
    switch (downwardMessage.type) {
      case DownwardMessageType.TUTOR_MESSAGE:
        type = 'tutor_message';
        message = TutorMessage.fromBinary(downwardMessage.payload);
        break;
      case DownwardMessageType.WORD_CORRECT_MESSAGE:
        type = 'word_correct_message';
        message = WordCorrectMessage.fromBinary(downwardMessage.payload);
        break;
      case DownwardMessageType.SENTENCE_CORRECT_MESSAGE:
        type = 'sentence_correct_message';
        message = SentenceCorrectMessage.fromBinary(downwardMessage.payload);
        break;
      default:
        throw new Error('Unknown message type: ' + downwardMessage.type);
    }

    onMessage?.({
      type,
      message,
    });
  }

  return { socket, sendUpwardMessage, closeSocket };
}