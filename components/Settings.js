import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const Settings = () => {
  return (
    <View
      style={styles.container}
    >
      <Text
        style={styles.text}
      >
        Settings
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Settings;