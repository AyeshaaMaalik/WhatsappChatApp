import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './scr/SplashScreen';
import LoginScreen from './scr/LoginScreen';
import SignupScreen from './scr/SignUpScreen';
import AddProfile from './scr/AddProfile';
import Parent from './scr/Parent';
import Contacts from './Drawer/Contacts';
import NewContact from './Drawer/NewContact';
import Message from './Drawer/Message';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }} 
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }} 
        />

        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }} 
        />

        <Stack.Screen
          name="Profile"
          component={AddProfile}
          options={{ headerShown: false }} 
        />

        <Stack.Screen
          name="Parent"
          component={Parent}
          options={{ headerShown: false }} 
        />

        <Stack.Screen
          name="Contacts"
          component={Contacts}
          options={{ headerShown: false }} 
        />

        <Stack.Screen
          name="New Contact"
          component={NewContact}
          options={{ headerShown: false }} 
        />

        <Stack.Screen
          name="Message"
          component={Message}
          options={{ headerShown: false }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
