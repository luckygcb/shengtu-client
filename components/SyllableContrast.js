import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const SyllableContrast = () => {
  return (
    <View
      style={styles.container}
    >
      <Text
        style={styles.text}
      >
        开发中，敬请期待
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

export default SyllableContrast;