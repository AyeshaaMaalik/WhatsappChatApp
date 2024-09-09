// SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Simulate loading process or delay
    setTimeout(() => {
      navigation.replace('Login'); // Navigate to LoginScreen after 2 seconds
    }, 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/whatsapp.png')} // Replace with your logo
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome to MyApp</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#075E54',
    marginTop: 20,
  },
});
