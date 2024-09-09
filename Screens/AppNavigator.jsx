// AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './scr/SplashScreen';
import LoginScreen from './scr/LoginScreen';
import SignupScreen from './scr/SignUpScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        {/* Splash Screen */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }} // Hide header for SplashScreen
        />

        {/* Login Screen */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Login' }} // Customize title if needed
        />

        {/* Signup Screen */}
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ title: 'Sign Up' }} // Customize title if needed
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
