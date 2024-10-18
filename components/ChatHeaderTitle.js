import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useAssistantAvatar } from '../hooks/useAssistantAvatar';

export default function ChatHeaderTitle({ route }) {
  const { getAvatar } = useAssistantAvatar();

  return (
    <View style={styles.header}>
      <Avatar.Image
        size={40}
        source={getAvatar()}
      />
      <Text style={styles.title}>{route.params.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginLeft: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: -15,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  }
});
