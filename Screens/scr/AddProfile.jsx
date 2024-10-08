import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database'; 
import { useNavigation } from '@react-navigation/native';

const AddProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        setProfilePic(source);
      }
    });
  };

  const uploadImage = async () => {
    if (!profilePic) return null;

    const { uri } = profilePic;
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

    const storageRef = storage().ref(`profiles/${filename}`);
    const task = storageRef.putFile(uploadUri);

    try {
      await task;
      const url = await storageRef.getDownloadURL();
      return url;
    } catch (e) {
      console.error('Image upload error: ', e);
      return null;
    }
  };

  const saveProfile = async () => {
    if (name === '' || email === '' || !profilePic) {
      Alert.alert('Error', 'Please add a name, email, and profile picture');
      return;
    }

    setIsLoading(true);

    const imageUrl = await uploadImage();
    if (!imageUrl) {
      Alert.alert('Error', 'Failed to upload profile picture');
      setIsLoading(false);
      return;
    }

    const newProfileRef = database().ref('profiles').push();  
    await newProfileRef.set({
      name: name,
      email: email,
      profilePicUrl: imageUrl,
    });

    Alert.alert('Profile Saved', 'Your profile has been created successfully');
    setIsLoading(false);

    navigation.navigate('Parent');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Profile</Text>

      <TouchableOpacity onPress={selectImage} style={styles.imageContainer}>
        {profilePic ? (
          <Image source={profilePic} style={styles.image} />
        ) : (
          <Text style={styles.addPhotoText}>Add Photo</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        placeholderTextColor="#999"
        onChangeText={(text) => setName(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        placeholderTextColor="#999"
        onChangeText={(text) => setEmail(text)}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#25D366" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={saveProfile}>
          <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#EDEDED',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#075E54',
    marginBottom: 30,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderColor: '#25D366',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  addPhotoText: {
    fontSize: 18,
    color: '#888',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    color: '#333',
  },
  button: {
    backgroundColor: '#25D366',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddProfileScreen;
