import  { Platform } from 'react-native';
import uuid from 'react-native-uuid';
import DeviceInfo from 'react-native-device-info';

export async function getDeviceId () {
  if (Platform.OS === 'web') {
    let deviceId = localStorage.getItem('echo_journey_deviceId');
    if (deviceId) {
      return deviceId;
    }

    deviceId = uuid.v4();
    localStorage.setItem('echo_journey_deviceId', deviceId);

    return deviceId;
  }

  return DeviceInfo.getUniqueId();
}