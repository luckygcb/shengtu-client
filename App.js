import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import TabBarComponent from './components/TabBar';

export default function App() {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <TabBarComponent />
        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
