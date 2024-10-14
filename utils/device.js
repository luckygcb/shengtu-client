import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getDeviceId () {

  let deviceId = await AsyncStorage.getItem('echo_journey_deviceId');
  if (deviceId) {
    return deviceId;
  }

  deviceId = uuid.v4();
  await AsyncStorage.setItem('echo_journey_deviceId', deviceId);

  return deviceId;
}