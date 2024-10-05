import React, { useState } from 'react';
import { BottomNavigation } from 'react-native-paper';
import ChatsComponent from './Chats';
import Settings from './Settings';

const ChatRoute = () => <ChatsComponent />;
const SettingsRoute = () => <Settings />;

const TabBarComponent = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'chat', title: '聊天', focusedIcon: 'chat-processing', unfocusedIcon: 'chat-processing-outline' },
    { key: 'settings', title: '设置', focusedIcon: 'account-settings', unfocusedIcon: 'account-settings-outline' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    chat: ChatRoute,
    settings: SettingsRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ backgroundColor: '#f5f5f5' }}
      activeColor="#33A3F4"
      inactiveColor="#949494"
    />
  );
};

export default TabBarComponent;