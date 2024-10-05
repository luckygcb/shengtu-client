import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PaperProvider, Button } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabBarComponent from './components/TabBar';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <TabBarComponent navigation={navigation} />
        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  );
}

function ChatScreen() {
  return (
    <View style={styles.container}>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          options={{ headerShown: false }}
          component={HomeScreen}
        />
        <Stack.Screen
          name="Chat"
          options={({ route }) => ({ title: route.params.name })}
          component={ChatScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
