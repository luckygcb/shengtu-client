import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { List, Avatar } from 'react-native-paper';

const ChatsComponent = ({ navigation }) => {
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
          {/* <List.Item
            title="听力大挑战"
            description="今天我们来聊点什么呢？"
            left={props => <List.Icon {...props} icon="chat" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Chat', { name: '听力大挑战' })}
          /> */}
          <List.Item
            title="瓜瓜"
            description="今天有什么想聊的话题？"
            style={{
              paddingLeft: 24,
            }}
            left={props => <Avatar.Image size={44} source={require('../assets/images/assistant.jpg')} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Chat', { name: '瓜瓜', scene: 'talk' })}
          />
          <List.Item
            title="斗斗"
            description={
              <Text>奖励你一大挑战？</Text>
            }
            style={{
              paddingLeft: 24,
            }}
            left={props => <Avatar.Image size={44} source={require('../assets/images/doudou.jpg')} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Chat', { name: '斗斗', scene: 'exercises' })}
          />
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