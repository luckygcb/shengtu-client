import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

const Loading = ({ size = 8, color = '#000', speed = 500 }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % 3);
    }, speed);

    return () => clearInterval(interval);
  }, [speed]);

  return (
    <View style={styles.container}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { 
              width: size, 
              height: size, 
              backgroundColor: index === activeIndex ? color : '#ccc'
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 3,
  },
});

export default Loading;

