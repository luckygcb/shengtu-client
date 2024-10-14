import './polyfill';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabBarComponent from './components/TabBar';
import ChatScreen from './components/ChatScreen';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TabBarComponent navigation={navigation} />
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <PaperProvider
      theme={{
        dark: false,
      }}
    >
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
    </PaperProvider>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
