import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const OtpScreen = ({ route, navigation }) => {
  const { confirmation, email, password, name } = route.params;
  const [otpCode, setOtpCode] = useState('');

  const handleVerifyOtp = async () => {
    try {
      // Verify the OTP code
      await confirmation.confirm(otpCode);

      // Once phone number is verified, create a new user
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);

      // Update the user's display name
      await userCredential.user.updateProfile({ displayName: name });

      Alert.alert('Success', 'Phone number verified and account created successfully.');
      navigation.navigate('LoginScreen'); // Navigate to the login screen

    } catch (error) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP sent to your phone"
        value={otpCode}
        onChangeText={setOtpCode}
        keyboardType="number-pad"
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#25D366',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
