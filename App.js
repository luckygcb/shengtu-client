import './polyfill';
import * as Sentry from '@sentry/react-native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PaperProvider, Avatar, Text } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabBarComponent from './components/TabBar';
import ChatScreen from './components/ChatScreen';
import ChatHeaderTitle from './components/ChatHeaderTitle';
import ChatFooter from './components/ChatFooter';

Sentry.init({
  dsn: 'https://010b7f4a3a360ccedd493320b4c5d498@o4508126757978112.ingest.us.sentry.io/4508126761582592',
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TabBarComponent navigation={navigation} />
      <StatusBar style="auto" />
    </View>
  );
}

export default Sentry.wrap(function App() {

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
            options={
              ({ route }) => ({
                headerTitle: () => <ChatHeaderTitle route={route} />,
              })
            }
            component={ChatScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
});



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
