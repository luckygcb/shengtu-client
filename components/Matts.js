import React from 'react';
import { View, StyleSheet } from 'react-native';

const Matts = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.gridHorizontal} />
      <View style={styles.gridVertical} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 34,
    height: 34,
    borderWidth: 2,
    borderColor: '#bcc1ca',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#bcc1ca',
    borderStyle: 'dashed',
  },
  gridVertical: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 0,
    height: '100%',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#bcc1ca',
    borderStyle: 'dashed',
  },
  content: {
    padding: 10,
  },
});

export default Matts;