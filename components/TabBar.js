import React, { useState } from 'react';
import { BottomNavigation } from 'react-native-paper';
import ChatsComponent from './Chats';
import SyllableContrast from './SyllableContrast';

const TabBarComponent = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'chat', title: '聊天', focusedIcon: 'chat-processing', unfocusedIcon: 'chat-processing-outline' },
    { key: 'syllable_contrast', title: '音节对照', focusedIcon: 'alpha-a-circle', unfocusedIcon: 'alpha-a-circle-outline' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    chat: () => <ChatsComponent navigation={navigation} />,
    syllable_contrast: () => <SyllableContrast />,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ backgroundColor: '#f5f5f5' }}
      activeColor="rgba(127,85,224,1)"
      inactiveColor="#949494"
      activeIndicatorStyle={{
        backgroundColor: '#f5f5f5'
      }}
    />
  );
};

export default TabBarComponent;