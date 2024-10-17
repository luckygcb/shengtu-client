import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { List, Avatar } from 'react-native-paper';
import { useAssistantAvatar } from '../hooks/useAssistantAvatar';

const ChatsComponent = ({ navigation }) => {

  const { getAvatar } = useAssistantAvatar();

  const chats = [
    {
      name: '瓜瓜',
      description: '今天有什么想聊的话题？',
      avatar: getAvatar('talk'),
      scene: 'talk',
    },
    {
      name: '斗斗',
      description: '奖励你一大挑战？',
      avatar: getAvatar('exercises'),
      scene: 'exercises',
    },
  ];

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
              description={chat.description}
              style={{
                paddingLeft: 24,
              }}
              left={props => <Avatar.Image size={44} source={chat.avatar} />}
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
  }
});

export default ChatsComponent;