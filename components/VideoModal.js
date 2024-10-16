import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Modal, Portal, IconButton } from 'react-native-paper';
import { Video, ResizeMode} from 'expo-av';

const VideoModal = ({ visible, hideModal, uri }) => {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={[styles.container, {
          height: screenHeight * 0.7,
          width: Math.min(screenWidth, screenHeight * 0.7 * (9 / 16)),
        }]}
      >
        <Video
          source={{ uri }}
          shouldPlay={true}
          style={styles.videoWrapper}
          videoStyle={styles.video}
          isLooping={true}
          resizeMode={ResizeMode.CONTAIN}
          dismissableBackButton={true}
        />
        <IconButton
          style={styles.closeButton}
          icon="close-circle-outline"
          iconColor="#fff"
          size={36}
          onPress={hideModal}
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 'auto',
    borderRadius: 10,
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
  },
  video: {
    maxWidth: '100%',
    height: '100%',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    bottom: -60,
    left: '50%',
    marginLeft: -26,
  }
});

export default VideoModal;