import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { List, Avatar, Badge } from 'react-native-paper';
import { useChats } from '../hooks/useChats';

const ChatsComponent = ({ navigation }) => {
  const { chats } = useChats();

  return (
    <View
      style={styles.container}
    >
      <Text
        style={styles.text}
      >
        Chats
      </Text>
      <ScrollView
        style={{
          flex: 1,
        }}
      >
        <List.Section>
          {chats.map((chat, index) => (
            <List.Item
              key={index}
              title={chat.name}
              description={<Text>{chat.description}</Text>}
              style={{
                paddingLeft: 24,
              }}
              left={props => (
                <View>
                  <Avatar.Image size={44} source={chat.avatar} />
                  {chat.update && (
                    <Badge
                      size={10}
                      style={styles.badge}
                    />
                  )}
                </View>
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Chat', { name: chat.name, scene: chat.scene })}
            />
          ))}
        </List.Section>
      </ScrollView>
    </View>
  )
}

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
  listWrapper: {
    width: '100%',
    flex: 1,
    backgroundColor: '#ddd',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#21d75f',
  }
});

export default ChatsComponent;