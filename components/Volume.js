import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-paper';

const Volume = ({ isPlaying, color }) => {
  const icons = ['volume-low', 'volume-medium', 'volume-high'];
  const iconOffsets = [-4, -2, 0];
  const [iconIndex, setIconIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setIconIndex((prevIndex) => (prevIndex + 1) % icons.length);
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <View style={{ marginLeft: isPlaying ? iconOffsets[iconIndex] : 0 }}>
      <Icon 
        source={isPlaying ? icons[iconIndex] : 'volume-high'} 
        size={24} 
        color={color} 
      />
    </View>
  );
}

export default Volume;