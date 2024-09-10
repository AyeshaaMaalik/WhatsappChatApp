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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address');
    } else if (password.length < 6) {
      Alert.alert('Invalid password', 'Password must be at least 6 characters long');
    } else {
      navigation.navigate('Main', { email });
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/whatsapp.png')} 
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Login to your account</Text>
      <Text style={styles.subtitle}>Please enter your email and password.</Text>

      <View style={styles.inputContainer}>
        <Fontisto name="email" size={20} color="#777" />
        <TextInput
          style={styles.input}
          placeholder="Email address"
          keyboardType="email-address"
          placeholderTextColor={"black"}
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
          placeholderTextColor={"black"}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#777" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signupText}>
          Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

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
    fontSize: 20,
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
    marginBottom: 30,
    width: '100%',
  },
  input: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
    color:'black',
  },
  button: {
    backgroundColor: '#25D366',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  signupText: {
    fontSize: 14,
    color: '#777',
  },
  signupLink: {
    color: '#25D366',
    fontWeight: 'bold',
  },
});
