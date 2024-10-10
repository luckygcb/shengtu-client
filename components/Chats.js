import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { List } from 'react-native-paper';

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
            title="发音大挑战"
            description="准备好了吗？"
            left={props => <List.Icon {...props} icon="chat" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Chat', { name: '发音大挑战' })}
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