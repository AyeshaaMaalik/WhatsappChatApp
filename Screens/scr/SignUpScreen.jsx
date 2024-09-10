import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Feather from 'react-native-vector-icons/Feather';
import auth from '@react-native-firebase/auth';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let intervalId;

    if (isVerifying) {
      intervalId = setInterval(async () => {
        const currentUser = auth().currentUser;
        if (currentUser) {
          await currentUser.reload(); // Refresh user data
          console.log('Email Verified Status:', currentUser.emailVerified); // Debugging log
          if (currentUser.emailVerified) {
            clearInterval(intervalId);
            Alert.alert('Email Verified', 'Your email has been successfully verified!');
            navigation.navigate('Profile');
          }
        }
      }, 3000); // Check every 3 seconds
    }

    // Cleanup the interval on component unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isVerifying, navigation]);

  // Function to handle the signup
  const handleSignup = async () => {
    const emailRegex = /\S+@\S+\.\S+/;

    if (name.trim().length < 3) {
      Alert.alert('Invalid Name', 'Name should be at least 3 characters long.');
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await user.updateProfile({
        displayName: name,
      });

      await user.sendEmailVerification();

      Alert.alert('Success', 'Verification link sent to your email.');
      setIsVerifying(true);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Signup Error:', error); 
      Alert.alert('Error', error.message || 'Failed to sign up. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/whatsapp.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {isVerifying ? (
        <>
          <Text style={styles.verifyingText}>Waiting for email verification...</Text>
          <ActivityIndicator size="large" color="#25D366" />
        </>
      ) : (
        <>
          <Text style={styles.title}>Create an Account</Text>
          <Text style={styles.subtitle}>Sign up with your email and password.</Text>

          <View style={styles.inputContainer}>
            <Fontisto name="person" size={20} color="#777" />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="black"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Fontisto name="email" size={20} color="#777" />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              keyboardType="email-address"
              placeholderTextColor="black"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#777" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="black"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#777" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#777" />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry={!showPassword}
              placeholderTextColor="black"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#25D366" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#075E54',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#075E54',
    paddingBottom: 8,
    marginBottom: 20,
    width: '100%',
  },
  input: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
    color: 'black',
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
  loginText: {
    marginTop: 20,
    color: '#075E54',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  verifyingText: {
    fontSize: 18,
    color: '#075E54',
    marginBottom: 10,
  },
});
