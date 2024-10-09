
import React from 'react';
import { View,Text, StyleSheet } from 'react-native';

const Letter = ({ letter, tone }) => {

  const getToneText = () => {
    if (!tone) return '';
    switch (tone) {
      case 1: return 'ˉ';
      case 2: return 'ˊ';
      case 3: return 'ˇ';
      case 4: return 'ˋ';
      default: return '';
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.letter}>{letter}</Text>
      {tone && <Text style={styles.tone}>{getToneText()}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column-reverse',
    height: 30
  },
  letter: {
    fontSize: 16,
    color: '#9095a0',
  },
  tone: {
    fontSize: 16,
    color: '#9095a0',
    lineHeight: 0,
    marginBottom: -8,
  },
});

export default Letter;