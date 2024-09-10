import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Button,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const AddProfileScreen = () => {
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState(null);

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

  const saveProfile = () => {
    if (name === '' || !profilePic) {
      Alert.alert('Error', 'Please add a name and profile picture');
      return;
    }

    console.log('Name:', name);
    console.log('Profile Picture:', profilePic.uri);
    Alert.alert('Profile Saved', 'Your profile has been created successfully');
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
        onChangeText={(text) => setName(text)}
      />

      <Button title="Save Profile" onPress={saveProfile} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderColor: '#ddd',
    borderWidth: 2,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  addPhotoText: {
    fontSize: 18,
    color: '#999',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
});

export default AddProfileScreen;
