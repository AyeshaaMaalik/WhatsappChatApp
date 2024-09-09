import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Feather from 'react-native-vector-icons/Feather';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = () => {
    const emailRegex = /\S+@\S+\.\S+/; 
    if (name.length < 3) {
      Alert.alert('Invalid Name', 'Name should be at least 3 characters long.');
    } else if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
    } else if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
    } else if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
    } else {
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('LoginScreen');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/whatsapp.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Create an Account</Text>
      <Text style={styles.subtitle}>Sign up with your details below.</Text>

      <View style={styles.inputContainer}>
        <Fontisto name="person" size={20} color="#777" />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Fontisto name="email" size={20} color="#777" />
        <TextInput
          style={styles.input}
          placeholder="Email address"
          keyboardType="email-address"
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
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={styles.loginText}>Already have an account? Log in</Text>
      </TouchableOpacity>
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
});
